const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Membuat notifikasi generik.
 */
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

/**
 * Notif ketika bantuan diambil relawan
 */
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

/**
 * Notif ketika misi selesai
 */
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

/**
 * Notif badge baru
 */
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

/**
 * Semua notifikasi user
 */
exports.getUserNotifications = async (userId) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Menghitung jumlah notif yang belum dibaca
 */
exports.countUnreadNotifications = async (userId) => {
    return prisma.notification.count({
        where: { userId, isRead: false }
    });
};

/**
 * Tandai satu notif sebagai read
 */
exports.markAsRead = async (id, userId) => {
    return prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
    });
};

/**
 * Tandai semua notif sebagai read
 */
exports.markAllAsRead = async (userId) => {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
};

/**
 * Hapus notif tertentu
 */
exports.deleteNotification = async (id, userId) => {
    return prisma.notification.deleteMany({
        where: { id, userId }
    });
};

/**
 * Hapus otomatis notif read lebih dari 7 hari
 */
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
