const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications');

async function createInitialInstances(userId) {
    try {
        // Creating Save instance
        const save = new Save({ user: userId, posts: [] });
        await save.save();

        // Creating Follow instance
        const follow = new Follow({ user: userId, followings: [], followers: [] });
        await follow.save();

        // Creating Notification instance
        const notification = new Notification({ userId, notifications: [] });
        await notification.save();

        console.log('Initial instances created for user:', userId);
    } catch (error) {
        console.error('Error creating initial instances:', error);
    }
}

module.exports = createInitialInstances;
