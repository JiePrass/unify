const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getCancelEventsForAdmin = async ({
    actor,
    stage,
    minViolationScore,
    from,
    to,
}) => {
    return prisma.cancelEvent.findMany({
        where: {
            actor: actor ?? undefined,
            stage: stage ?? undefined,
            violation_score: minViolationScore
                ? { gte: minViolationScore }
                : undefined,
            created_at: {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(to) : undefined,
            },
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            actorUser: {
                select: {
                    id: true,
                    full_name: true,
                    reputation_score: true,
                },
            },
            helpRequest: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                },
            },
            assignment: {
                select: {
                    id: true,
                    helper_id: true,
                },
            },
        },
    });
};

exports.executePenalty = async (cancelEventId, adminId, options = {}) => {
    return prisma.$transaction(async (tx) => {
        const { targetUserId = null, notes = null } = options;

        // 1. Get cancel event with user info
        const cancelEvent = await tx.cancelEvent.findUnique({
            where: { id: cancelEventId },
            include: {
                actorUser: {
                    select: {
                        id: true,
                        reputation_score: true,
                    },
                },
                helpRequest: {
                    select: {
                        category: true,
                    },
                },
                assignment: {
                    select: {
                        helper_id: true,
                    },
                },
            },
        });

        if (!cancelEvent) {
            throw new Error('Cancel event not found');
        }

        // 2. Determine target user
        let userToPenalizeId = targetUserId || cancelEvent.actor_user_id;

        if (!userToPenalizeId) {
            throw new Error('Cannot execute penalty: no target user');
        }

        // Get target user's current reputation
        const targetUser = await tx.user.findUnique({
            where: { id: userToPenalizeId },
            select: { id: true, reputation_score: true },
        });

        if (!targetUser) {
            throw new Error('Target user not found');
        }

        // 3. Calculate base penalty (weighted)
        const IMPACT_WEIGHT = 0.6;
        const VIOLATION_WEIGHT = 0.4;
        const basePenalty = 
            (cancelEvent.impact_score * IMPACT_WEIGHT) + 
            (cancelEvent.violation_score * VIOLATION_WEIGHT);

        // 4. Stage multiplier
        const stageMultipliers = {
            BEFORE_TAKEN: 1.0,
            AFTER_TAKEN: 1.5,
            AFTER_CONFIRMED: 2.0,
        };
        const stageMultiplier = stageMultipliers[cancelEvent.stage] || 1.0;

        // 5. Repeat offender multiplier (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentCancelCount = await tx.cancelEvent.count({
            where: {
                actor_user_id: userToPenalizeId,
                created_at: { gte: thirtyDaysAgo },
                id: { not: cancelEventId },
            },
        });

        const repeatMultiplier = 1.0 + (recentCancelCount * 0.2);

        // 6. Calculate final penalty
        const finalPenalty = Math.round(basePenalty * stageMultiplier * repeatMultiplier);

        // 7. Update user reputation (ENFORCE 0-100 BOUNDS)
        const currentReputation = targetUser.reputation_score;
        const newReputation = Math.max(0, Math.min(100, currentReputation - finalPenalty));

        await tx.user.update({
            where: { id: userToPenalizeId },
            data: { reputation_score: newReputation },
        });

        // 8. Create audit log
        const penaltyDetails = {
            cancel_event_id: cancelEventId,
            actor_user_id: cancelEvent.actor_user_id,
            penalized_user_id: userToPenalizeId,
            is_override: targetUserId !== null,
            admin_notes: notes,
            base_penalty: basePenalty,
            stage_multiplier: stageMultiplier,
            repeat_multiplier: repeatMultiplier,
            final_penalty: finalPenalty,
            old_reputation: currentReputation,
            new_reputation: newReputation,
        };

        await tx.auditLog.create({
            data: {
                admin_id: adminId,
                action: 'EXECUTE_CANCEL_PENALTY',
                metadata: JSON.stringify(penaltyDetails),
            },
        });

        return {
            success: true,
            penalty_applied: finalPenalty,
            penalized_user_id: userToPenalizeId,
            old_reputation: currentReputation,
            new_reputation: newReputation,
            breakdown: penaltyDetails,
        };
    });
};

exports.getCancelEventDetail = async (cancelEventId) => {
    const cancelEvent = await prisma.cancelEvent.findUnique({
        where: { id: cancelEventId },
        include: {
            actorUser: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    reputation_score: true,
                },
            },
            helpRequest: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    category: true,
                    status: true,
                    created_at: true,
                    user_id: true,
                },
            },
            assignment: {
                select: {
                    id: true,
                    helper_id: true,
                    status: true,
                    taken_at: true,
                    confirmed_at: true,
                    completed_at: true,
                    failed_at: true,
                    helper: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            reputation_score: true,
                        },
                    },
                },
            },
        },
    });

    if (!cancelEvent) {
        throw new Error('Cancel event not found');
    }

    let chatHistory = [];
    if (cancelEvent.assignment_id) {
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { assignment_id: cancelEvent.assignment_id },
            include: {
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                full_name: true,
                            },
                        },
                    },
                    orderBy: { created_at: 'asc' },
                },
            },
        });

        if (chatRoom) {
            chatHistory = chatRoom.messages.map(msg => ({
                sender_id: msg.sender_id,
                sender_name: msg.sender.full_name,
                role: msg.sender_id === cancelEvent.helpRequest.user_id ? 'REQUESTER' : 'HELPER',
                message: msg.message,
                created_at: msg.created_at,
            }));
        }
    }

    const timeline = [];
    timeline.push({
        event: 'REQUEST_CREATED',
        timestamp: cancelEvent.helpRequest.created_at,
    });

    if (cancelEvent.assignment) {
        if (cancelEvent.assignment.taken_at) {
            timeline.push({
                event: 'HELP_TAKEN',
                timestamp: cancelEvent.assignment.taken_at,
            });
        }
        if (cancelEvent.assignment.confirmed_at) {
            timeline.push({
                event: 'HELP_CONFIRMED',
                timestamp: cancelEvent.assignment.confirmed_at,
            });
        }
    }

    if (chatHistory.length > 0) {
        const helperMessages = chatHistory.filter(m => m.role === 'HELPER');
        const requesterMessages = chatHistory.filter(m => m.role === 'REQUESTER');

        if (helperMessages.length > 0) {
            timeline.push({
                event: 'LAST_HELPER_MESSAGE',
                timestamp: helperMessages[helperMessages.length - 1].created_at,
            });
        }
        if (requesterMessages.length > 0) {
            timeline.push({
                event: 'LAST_REQUESTER_MESSAGE',
                timestamp: requesterMessages[requesterMessages.length - 1].created_at,
            });
        }
    }

    timeline.push({
        event: 'HELP_CANCELLED',
        timestamp: cancelEvent.created_at,
    });

    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
        cancelEvent: {
            id: cancelEvent.id,
            actor: cancelEvent.actor,
            reason_code: cancelEvent.reason_code,
            reason_text: cancelEvent.reason_text,
            stage: cancelEvent.stage,
            impact_score: cancelEvent.impact_score,
            violation_score: cancelEvent.violation_score,
            created_at: cancelEvent.created_at,
        },
        actorUser: cancelEvent.actorUser,
        helpRequest: cancelEvent.helpRequest,
        assignment: cancelEvent.assignment,
        helperUser: cancelEvent.assignment?.helper || null,
        chatHistory,
        timeline,
    };
};
