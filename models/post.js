const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    publicationDate: Date,
    tags: [String],
    viewsCount: Number,
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
})
const Post = mongoose.model('Post', postSchema);
module.exports = Post;