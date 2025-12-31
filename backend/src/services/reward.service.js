const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.processCompletionReward = async (helperId, category) => {
    const BASE_REWARD = 2;

    const categoryMultipliers = {
        FISIK: 1.0,
        MEDIS: 1.3,
        LOGISTIK: 1.1,
        TRANSPORTASI: 1.2,
        KEAMANAN: 1.5,
    };

    const reward = Math.round(
        BASE_REWARD * (categoryMultipliers[category] || 1)
    );

    if (reward <= 0) return;

    await prisma.user.update({
        where: { id: helperId },
        data: {
            reputation_score: {
                increment: reward,
            },
        },
    });
};
