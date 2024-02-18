const mongoose = require('mongoose');
const followerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    following : [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    followedBy:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }]
})
const Follow = mongoose.model('Follow', followerSchema);
module.exports = Follow;