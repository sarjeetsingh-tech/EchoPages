const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notifications: {
        type: [{
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post'
            },
            actionBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            notificationType: {
                type: String,
                enum: ['comment', 'like', 'follow'],
                required: true
            },
            checked: {
                type: Boolean
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            expiryAt: {
                type: Date // Add expiry timestamp
            },
            read: {
                type: Boolean,
                default: false // Mark notification as unread by default
            }
        }],
        default: []
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
