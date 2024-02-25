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
        default: [] // Set default value to an empty array
    }
});

const Save = mongoose.model('Save', savedSchema);

module.exports = Save;
