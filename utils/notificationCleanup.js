const Notification = require('../models/notifications');

async function cleanupExpiredNotifications() {
    try {
        // Finding notifications with expiry timestamp less than or equal to current time
        const expiredNotifications = await Notification.find({ 'notifications.expiryAt': { $lte: new Date() } });

        // Removing expired notifications from the database
        for (const notification of expiredNotifications) {
            // Filter out expired notifications and save the updated document
            notification.notifications = notification.notifications.filter(notif => notif.expiryAt > new Date());
            await notification.save();
        }
    } catch (error) {
        console.error('Error cleaning up expired notifications:', error);
    }
}

module.exports = cleanupExpiredNotifications;
