const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CREATE
exports.createHelpRequest = async (userId, data) => {
    const timeoutAt = new Date(Date.now() + 10 * 60 * 1000);
    const graceEnd = new Date(timeoutAt.getTime() + 10 * 60 * 1000);

    return prisma.helpRequest.create({
        data: {
            user_id: userId,
            title: data.title,
            description: data.description,
            category: data.category,
            latitude: data.latitude,
            longitude: data.longitude,
            timeout_at: timeoutAt,
            grace_period_end: graceEnd,
        }
    });
};

// LIST untuk relawan
exports.getNearbyHelpRequests = async (lat, lng, radius = 5000) => {
    // nanti bisa ditambah Haversine formula di level query
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
