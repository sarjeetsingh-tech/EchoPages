const mongoose = require('mongoose');

// Define the schema for notifications
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notifications: [{
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
        }
    }]
});

// Create a model for notifications using the schema
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
