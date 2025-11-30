const notificationService = require('../services/notification.service');

/**
 * List notifikasi user + jumlah unread
 */
exports.list = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const notifications = await notificationService.getUserNotifications(userId);
        const unreadCount = await notificationService.countUnreadNotifications(userId);

        res.json({
            success: true,
            unreadCount,
            notifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Tandai satu notifikasi sebagai read
 */
exports.read = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;

        await notificationService.markAsRead(id, userId);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

/**
 * Tandai semua notifikasi user sebagai read
 */
exports.readAll = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

/**
 * Hapus satu notifikasi
 */
exports.delete = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;

        await notificationService.deleteNotification(id, userId);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
