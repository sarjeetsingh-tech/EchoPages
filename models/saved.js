const mongoose = require('mongoose');
const savedSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    posts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    }]
})
const Save = mongoose.model('Save', savedSchema);
module.exports = Save;