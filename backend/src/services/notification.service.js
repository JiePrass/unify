const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createNotification = async (userId, title, message, type, refId = null) => {
    return prisma.notification.create({
        data: {
            userId,
            title,
            message,
            type,
            refId
        }
    });
};

exports.notifyHelpTaken = async (requesterId, helpRequestId) => {
    return prisma.notification.create({
        data: {
            userId: requesterId,
            title: "Permintaan Bantuan Diambil",
            message: "Seorang relawan telah mengambil permintaan bantuan Anda.",
            type: "HELP",
            refId: helpRequestId
        }
    });
};

exports.notifyMissionComplete = async (userId, missionId) => {
    return prisma.notification.create({
        data: {
            userId,
            title: "Misi Selesai",
            message: "Anda telah menyelesaikan sebuah misi. Klaim hadiah Anda.",
            type: "MISSION",
            refId: missionId
        }
    });
};

exports.notifyNewBadge = async (userId, badgeId) => {
    return prisma.notification.create({
        data: {
            userId,
            title: "Badge Baru",
            message: "Anda mendapatkan badge baru.",
            type: "BADGE",
            refId: badgeId
        }
    });
};

exports.getUserNotifications = async (userId) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

exports.countUnreadNotifications = async (userId) => {
    return prisma.notification.count({
        where: { userId, isRead: false }
    });
};

exports.markAsRead = async (id, userId) => {
    return prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
    });
};

exports.markAllAsRead = async (userId) => {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
};

exports.deleteNotification = async (id, userId) => {
    return prisma.notification.deleteMany({
        where: { id, userId }
    });
};

exports.deleteOldReadNotifications = async () => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);

    return prisma.notification.deleteMany({
        where: {
            isRead: true,
            createdAt: { lt: threshold }
        }
    });
};
