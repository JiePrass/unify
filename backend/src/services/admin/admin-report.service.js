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
