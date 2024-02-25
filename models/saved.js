const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    posts: {
        type: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Post'
        }],
        default: []
    }
});

const Save = mongoose.model('Save', savedSchema);

module.exports = Save;
