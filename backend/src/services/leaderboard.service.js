const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTopUsers = async (limit = 10) => {
    const users = await prisma.user.findMany({
        orderBy: [
            { points: "desc" },
            { created_at: "asc" },
        ],
        take: limit,
        select: {
            id: true,
            full_name: true,
            avatar_url: true,
            points: true,
        },
    });

    return users.map((u, i) => ({
        rank: i + 1,
        ...u,
    }));
};

exports.getUserRank = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
    });

    if (!user) return null;

    const higherRankCount = await prisma.user.count({
        where: {
            points: {
                gt: user.points,
            },
        },
    });

    return {
        user_id: userId,
        rank: higherRankCount + 1,
        points: user.points,
    };
};
