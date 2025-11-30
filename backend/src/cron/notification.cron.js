const cron = require('node-cron');
const notificationService = require('../services/notification.service');

cron.schedule('0 0 * * *', async () => {
    try {
        const result = await notificationService.deleteOldReadNotifications();
        console.log(`Cron job: ${result.count} notifikasi lama dihapus`);
    } catch (error) {
        console.error('Cron job error:', error);
    }
});