const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createNotification = async (user_id, title, body, type, tx = null) => {
    const client = tx || prisma;
    return client.notification.create({
        data: {
            user_id,
            title,
            body,
            type
        }
    });
};

exports.notifyHelpTaken = async (requesterId, helpRequestId) => {
    return prisma.notification.create({
        data: {
            user_id: requesterId,
            title: "Permintaan Bantuan Diambil",
            body: "Seorang relawan telah mengambil permintaan bantuan Anda.",
            type: "HELP"
        }
    });
};

exports.notifyMissionComplete = async (user_id, missionId) => {
    return prisma.notification.create({
        data: {
            user_id,
            title: "Misi Selesai",
            body: "Anda telah menyelesaikan sebuah misi. Klaim hadiah Anda.",
            type: "MISSION"
        }
    });
};

exports.notifyNewBadge = async (user_id, badgeId) => {
    return prisma.notification.create({
        data: {
            user_id,
            title: "Badge Baru",
            body: "Anda mendapatkan badge baru.",
            type: "BADGE"
        }
    });
};

exports.getUserNotifications = async (user_id) => {
    return prisma.notification.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' }
    });
};

exports.countUnreadNotifications = async (user_id) => {
    return prisma.notification.count({
        where: { user_id, is_read: false }
    });
};

exports.markAsRead = async (id, user_id) => {
    return prisma.notification.updateMany({
        where: { id, user_id },
        data: { is_read: true }
    });
};

exports.markAllAsRead = async (user_id) => {
    return prisma.notification.updateMany({
        where: { user_id, is_read: false },
        data: { is_read: true }
    });
};

exports.deleteNotification = async (id, user_id) => {
    return prisma.notification.deleteMany({
        where: { id, user_id }
    });
};

exports.deleteOldReadNotifications = async () => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);

    return prisma.notification.deleteMany({
        where: {
            is_read: true,
            created_at: { lt: threshold }
        }
    });
};
