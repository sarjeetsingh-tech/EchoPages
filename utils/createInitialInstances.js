const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications');

// Function to create instances for Save, Follow, and Notification models for a new user
async function createInitialInstances(userId) {
    try {
        // Create Save instance
        const save = new Save({ user: userId, posts: [] });
        await save.save();

        // Create Follow instance
        const follow = new Follow({ user: userId, followings: [], followers: [] });
        await follow.save();

        // Create Notification instance
        const notification = new Notification({ userId, notifications: [] });
        await notification.save();

        console.log('Initial instances created for user:', userId);
    } catch (error) {
        console.error('Error creating initial instances:', error);
    }
}

module.exports = createInitialInstances;
