const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getCancelHelpRequestForAdmin = async ({
    actor,
    stage,
    minViolationScore,
    from,
    to,
    onlyPending,
}) => {
    return prisma.cancelHelpRequest.findMany({
        where: {
            ...(actor && {
                actor,
            }),

            ...(stage && {
                stage,
            }),

            ...(minViolationScore && {
                violation_score: {
                    gte: minViolationScore,
                },
            }),

            ...((from || to) && {
                created_at: {
                    ...(from && { gte: new Date(from) }),
                    ...(to && { lte: new Date(to) }),
                },
            }),

            ...(onlyPending === true && {
                penalty_executed: false,
            }),
        },

        orderBy: {
            created_at: "desc",
        },

        select: {
            id: true,
            actor: true,
            stage: true,
            violation_score: true,
            created_at: true,
            penalty_executed: true,
            penalty_executed_at: true,

            actorUser: {
                select: {
                    id: true,
                    full_name: true,
                },
            },

            helpRequest: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                },
            },
        },
    });
};

exports.executePenalty = async (cancelHelpRequestId, adminId, options = {}) => {
    return prisma.$transaction(async (tx) => {
        const { targetUserId = null, notes = null } = options;

        // 1. Fetch & validate cancel event
        const cancelHelpRequest = await tx.cancelHelpRequest.findUnique({
            where: { id: cancelHelpRequestId },
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

        if (!cancelHelpRequest) {
            throw new Error('Cancel event not found');
        }

        if (cancelHelpRequest.penalty_executed) {
            throw new Error('Penalty already executed for this cancel event');
        }

        const userToPenalizeId =
            targetUserId ?? cancelHelpRequest.actor_user_id;

        if (!userToPenalizeId) {
            throw new Error('Cannot execute penalty: no target user');
        }

        const targetUser = await tx.user.findUnique({
            where: { id: userToPenalizeId },
            select: { id: true, reputation_score: true },
        });

        if (!targetUser) {
            throw new Error('Target user not found');
        }

        const IMPACT_WEIGHT = 0.6;
        const VIOLATION_WEIGHT = 0.4;

        const basePenalty =
            (cancelHelpRequest.impact_score * IMPACT_WEIGHT) +
            (cancelHelpRequest.violation_score * VIOLATION_WEIGHT);

        const stageMultipliers = {
            BEFORE_TAKEN: 1.0,
            AFTER_TAKEN: 1.5,
            AFTER_CONFIRMED: 2.0,
        };

        const stageMultiplier =
            stageMultipliers[cancelHelpRequest.stage] ?? 1.0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentCancelCount = await tx.cancelHelpRequest.count({
            where: {
                actor_user_id: userToPenalizeId,
                created_at: { gte: thirtyDaysAgo },
                penalty_executed: true,
                id: { not: cancelHelpRequestId },
            },
        });

        const repeatMultiplier = 1.0 + (recentCancelCount * 0.2);

        const finalPenalty = Math.round(
            basePenalty * stageMultiplier * repeatMultiplier
        );

        const newReputation = Math.max(
            0,
            Math.min(100, targetUser.reputation_score - finalPenalty)
        );

        await tx.user.update({
            where: { id: userToPenalizeId },
            data: { reputation_score: newReputation },
        });

        // 8. Mark cancel event as executed (CRITICAL)
        await tx.cancelHelpRequest.update({
            where: { id: cancelHelpRequestId },
            data: {
                penalty_executed: true,
                penalty_executed_at: new Date(),
                penalty_executed_by: adminId,
            },
        });

        // 9. Audit log
        await tx.auditLog.create({
            data: {
                admin_id: adminId,
                action: 'EXECUTE_CANCEL_PENALTY',
                metadata: JSON.stringify({
                    cancel_event_id: cancelHelpRequestId,
                    penalized_user_id: userToPenalizeId,
                    final_penalty: finalPenalty,
                    old_reputation: targetUser.reputation_score,
                    new_reputation: newReputation,
                    is_override: targetUserId !== null,
                    notes,
                }),
            },
        });

        return {
            success: true,
            penalty_applied: finalPenalty,
            penalized_user_id: userToPenalizeId,
            old_reputation: targetUser.reputation_score,
            new_reputation: newReputation,
        };
    });
};

exports.getCancelHelpRequestDetail = async (cancelHelpRequestId) => {
    const cancelHelpRequest = await prisma.cancelHelpRequest.findUnique({
        where: { id: cancelHelpRequestId },
        include: {
            actorUser: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    reputation_score: true,
                },
            },
            penaltyExecutedBy: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
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

    if (!cancelHelpRequest) {
        throw new Error('Cancel Help Request not found');
    }

    let chatHistory = [];
    if (cancelHelpRequest.assignment_id) {
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { assignment_id: cancelHelpRequest.assignment_id },
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
                role: msg.sender_id === cancelHelpRequest.helpRequest.user_id ? 'REQUESTER' : 'HELPER',
                message: msg.message,
                created_at: msg.created_at,
            }));
        }
    }

    const timeline = [];
    timeline.push({
        event: 'REQUEST_CREATED',
        timestamp: cancelHelpRequest.helpRequest.created_at,
    });

    if (cancelHelpRequest.assignment) {
        if (cancelHelpRequest.assignment.taken_at) {
            timeline.push({
                event: 'HELP_TAKEN',
                timestamp: cancelHelpRequest.assignment.taken_at,
            });
        }
        if (cancelHelpRequest.assignment.confirmed_at) {
            timeline.push({
                event: 'HELP_CONFIRMED',
                timestamp: cancelHelpRequest.assignment.confirmed_at,
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
        timestamp: cancelHelpRequest.created_at,
    });

    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
        cancelHelpRequest: {
            id: cancelHelpRequest.id,
            actor: cancelHelpRequest.actor,
            reason_code: cancelHelpRequest.reason_code,
            reason_text: cancelHelpRequest.reason_text,
            stage: cancelHelpRequest.stage,
            impact_score: cancelHelpRequest.impact_score,
            violation_score: cancelHelpRequest.violation_score,
            created_at: cancelHelpRequest.created_at,
            penalty_executed: cancelHelpRequest.penalty_executed,
            penalty_executed_at: cancelHelpRequest.penalty_executed_at,
            penalty_executed_by: cancelHelpRequest.penaltyExecutedBy ?? null,
        },
        actorUser: cancelHelpRequest.actorUser,
        helpRequest: cancelHelpRequest.helpRequest,
        assignment: cancelHelpRequest.assignment,
        helperUser: cancelHelpRequest.assignment?.helper || null,
        chatHistory,
        timeline,
    };
};
