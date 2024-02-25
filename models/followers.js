const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    followings: {
        type: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }],
        default: []
    },
    followers: {
        type: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }],
        default: []
    }
});

const Follow = mongoose.model('Follow', followerSchema);

module.exports = Follow;
