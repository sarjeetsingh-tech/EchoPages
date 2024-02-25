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
                type: Date,
                default: () => new Date(Date.now() + 24*60*60*1000)
            },
            read: {
                type: Boolean,
                default: false
            }
        }],
        default: []
    }
});


const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
