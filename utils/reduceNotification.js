const Notification=require('../models/notifications');
const reduceNotifications = async function (req, res, next) {
    try {
        const data = await Notification.findOne({ userId: req.user._id });
        if (data.notifications.length > 50) {
            // Sort notifications by createdAt date in ascending order
            data.notifications.sort((a, b) => a.createdAt - b.createdAt);

            // Remove the oldest notification
            data.notifications.shift();
            // Save the updated data
            await data.save();
        }
        next();
    } catch (error) {
        // Handle errors
        next(error);
    }
};
module.exports=reduceNotifications;