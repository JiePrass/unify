const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const missionService = require('../missions.service');
const chatService = require('../chat.service');

exports.markCompleted = async (assignmentId, helperId) => {
    return prisma.$transaction(async (tx) => {

        const assignment = await tx.helpAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                helpRequest: true,
            },
        });

        if (!assignment) {
            throw { status: 404, message: 'Assignment tidak ditemukan' };
        }

        if (assignment.helper_id !== helperId) {
            throw { status: 403, message: 'Akses ditolak' };
        }

        if (assignment.status !== 'CONFIRMED' && assignment.helpRequest.status !== 'IN_PROGRESS') {
            throw {
                status: 409,
                message: 'Bantuan belum atau sudah diselesaikan',
            };
        }

        await tx.helpAssignment.update({
            where: { id: assignmentId },
            data: {
                status: 'COMPLETED',
                completed_at: new Date(),
            },
        });

        await tx.helpRequest.update({
            where: { id: assignment.help_request_id },
            data: { status: 'COMPLETED' },
        });

        chatService.closeChatRoom(assignment.id, tx)

        // ===== REPUTATION REWARD SYSTEM =====
        const category = assignment.helpRequest.category;
        
        // 1. Base reward
        const BASE_REWARD = 2;
        
        // 2. Category multiplier
        const categoryMultipliers = {
            FISIK: 1.0,
            MEDIS: 1.3,
            LOGISTIK: 1.1,
            TRANSPORTASI: 1.2,
            KEAMANAN: 1.5,
        };
        const categoryMultiplier = categoryMultipliers[category] || 1.0;
        
        // 3. Streak bonus (consecutive completions in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const streakCount = await tx.helpAssignment.count({
            where: {
                helper_id: helperId,
                status: 'COMPLETED',
                completed_at: { gte: sevenDaysAgo },
            },
        });
        const streakMultiplier = 1.0 + Math.min(streakCount * 0.05, 0.25);
        
        // 4. Calculate base reward
        let calculatedReward = BASE_REWARD * categoryMultiplier * streakMultiplier;
        
        // 5. DAILY CAP (15 points max per day)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        // Query completed assignments today (we'll use completed_at as proxy for reputation gain time)
        const completedToday = await tx.helpAssignment.findMany({
            where: {
                helper_id: helperId,
                status: 'COMPLETED',
                completed_at: { gte: todayStart },
            },
            include: {
                helpRequest: { select: { category: true } },
            },
        });
        
        // Estimate daily earned (rough calculation)
        let dailyEarned = 0;
        for (const comp of completedToday) {
            const cat = comp.helpRequest.category;
            const catMult = categoryMultipliers[cat] || 1.0;
            dailyEarned += BASE_REWARD * catMult; // Simplified estimation
        }
        
        if (dailyEarned >= 15) {
            calculatedReward = 0; // Daily cap exceeded
        } else {
            calculatedReward = Math.min(calculatedReward, 15 - dailyEarned);
        }
        
        // 6. COOLDOWN (30 min between rewards)
        const lastCompletion = completedToday
            .filter(c => c.id !== assignmentId)
            .sort((a, b) => b.completed_at - a.completed_at)[0];
            
        if (lastCompletion) {
            const timeSinceLast = Date.now() - lastCompletion.completed_at.getTime();
            const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
            
            if (timeSinceLast < COOLDOWN_MS) {
                calculatedReward *= 0.5; // 50% penalty for rushing
            }
        }
        
        // 7. DIMINISHING RETURNS (same category in 24h)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        
        const sameCategoryCount = await tx.helpAssignment.count({
            where: {
                helper_id: helperId,
                status: 'COMPLETED',
                completed_at: { gte: twentyFourHoursAgo },
                helpRequest: { category },
            },
        });
        
        if (sameCategoryCount >= 3) {
            calculatedReward *= 0.3; // 70% reduction after 3rd same-category help
        }
        
        // 8. Round and clamp reward (0-100 bounds)
        const finalReward = Math.round(calculatedReward);
        
        if (finalReward > 0) {
            // Get current reputation and clamp to max 100
            const currentUser = await tx.user.findUnique({
                where: { id: helperId },
                select: { reputation_score: true },
            });
            
            const newReputation = Math.min(100, currentUser.reputation_score + finalReward);
            
            await tx.user.update({
                where: { id: helperId },
                data: {
                    reputation_score: newReputation,
                },
            });
        }

        // reward => helper
        await missionService.updateMissionProgress(
            helperId,
            'HELP_COMPLETED',
            1,
            tx
        );

        return { success: true };
    });
};


exports.markFailed = async (assignmentId) => {
    const assignment = await prisma.helpAssignment.update({
        where: { id: assignmentId },
        data: {
            status: "FAILED",
            failed_at: new Date()
        }
    });

    await prisma.helpRequest.update({
        where: { id: assignment.help_request_id },
        data: { status: "CANCELLED" }
    });

    chatService.closeChatRoom(assignment.id)

    return assignment;
};

exports.markTimeout = async (helpRequestId) => {
    const help = await prisma.helpRequest.findUnique({ where: { id: helpRequestId }});

    if (!help) return null;
    if (help.status !== "OPEN") return null; 

    return prisma.helpRequest.update({
        where: { id: helpRequestId },
        data: { status: "TIMEOUT" }
    });
};

exports.markGracePeriodEnd = async (helpRequestId) => {
    const help = await prisma.helpRequest.findUnique({
        where: { id: helpRequestId },
        include: { assignments: true }
    });

    if (!help) return null;
    if (help.status !== "TAKEN") return null;

    return prisma.helpRequest.update({
        where: { id: helpRequestId },
        data: { status: "CANCELLED" }
    });
};

