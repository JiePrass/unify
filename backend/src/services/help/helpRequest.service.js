const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const missionService = require('../missions/missions.service');

// CREATE
exports.createHelpRequest = async (userId, data) => {
    return prisma.$transaction(async (tx) => {

        const ACTIVE_STATUSES = ['OPEN', 'TAKEN', 'IN_PROGRESS'];

        // Cek: user tidak boleh punya bantuan aktif
        const activeHelp = await tx.helpRequest.findFirst({
            where: {
                user_id: userId,
                status: { in: ACTIVE_STATUSES },
            },
            select: { id: true },
        });

        if (activeHelp) {
            throw new Error('User masih memiliki permintaan bantuan aktif');
        }

        const timeoutAt = new Date(Date.now() + 10 * 60 * 1000);
        const graceEnd = new Date(timeoutAt.getTime() + 10 * 60 * 1000);

        const help = await tx.helpRequest.create({
            data: {
                user_id: userId,
                title: data.title,
                description: data.description,
                category: data.category,
                latitude: data.latitude,
                longitude: data.longitude,
                timeout_at: timeoutAt,
                grace_period_end: graceEnd,
            },
        });

        await missionService.updateMissionProgress(
            userId,
            'HELP_REQUEST',
            1,
            tx
        );

        return help;
    });
};


// LIST untuk relawan
exports.getNearbyHelpRequests = async (lat, lng, radius = 5000) => {
    return prisma.$queryRaw`
        SELECT * FROM "HelpRequest"
        WHERE status = 'OPEN'
        AND deleted_at IS NULL
    `;
};

// DETAIL
exports.getHelpRequestById = async (id) => {
    return prisma.helpRequest.findUnique({ where: { id } });
};

// SOFT DELETE
exports.deleteHelpRequest = async (userId, helpId) => {
    return prisma.helpRequest.update({
        where: { id: helpId, user_id: userId },
        data: { deleted_at: new Date() }
    });
};
