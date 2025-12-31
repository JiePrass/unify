const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const missionService = require('../missions.service');
const rewardService = require('../reward.service')
const chatService = require('../chat.service');
const notificationService = require('../notification.service');

exports.markCompleted = async (assignmentId, helperId) => {
    // ======================
    // 1. VALIDASI AWAL
    // ======================
    const assignment = await prisma.helpAssignment.findUnique({
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

    if (
        assignment.status !== 'CONFIRMED' ||
        assignment.helpRequest.status !== 'IN_PROGRESS'
    ) {
        throw {
            status: 409,
            message: 'Bantuan belum atau sudah diselesaikan',
        };
    }

    // ======================
    // 2. TRANSACTION (RINGAN)
    // ======================
    await prisma.$transaction(async (tx) => {
        await tx.helpRequest.update({
            where: { id: assignment.help_request_id },
            data: { status: 'COMPLETED' },
        });

        await tx.helpAssignment.update({
            where: { id: assignmentId },
            data: {
                status: 'COMPLETED',
                completed_at: new Date(),
            },
        });

        await chatService.closeChatRoomTx(tx, assignment.id);

        await tx.notification.create({
            data: {
                user_id: assignment.helpRequest.user_id,
                title: "Bantuan Selesai",
                body: "Relawan telah menyelesaikan permintaan bantuan Anda. Terima kasih!",
                type: "HELP"
            }
        });
    });

    // ======================
    // 3. SIDE EFFECTS (NO TX)
    // ======================

    // Reward reputation (boleh gagal tanpa rollback)
    rewardService
        .processCompletionReward(helperId, assignment.helpRequest.category)
        .catch((err) => {
            console.error('Reward error:', err);
        });

    // Mission progress
    missionService
        .updateMissionProgress(
            helperId,
            'HELP_COMPLETED',
            1
        )
        .catch((err) => {
            console.error('Mission error:', err);
        });

    return { success: true };
};


exports.markFailed = async (assignmentId) => {
    return prisma.$transaction(async (tx) => {
        const assignment = await tx.helpAssignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) throw new Error("Assignment not found");

        await tx.helpRequest.update({
            where: { id: assignment.help_request_id },
            data: { status: "CANCELLED" }
        });

        await tx.helpAssignment.update({
            where: { id: assignmentId },
            data: {
                status: "FAILED",
                failed_at: new Date()
            }
        });

        chatService.closeChatRoom(assignmentId);

        return assignment;
    });
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

