const mongoose = require("mongoose");
const moment = require("moment");

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    tags: [String],
    viewsCount: Number,
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    comments:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Comment'
        }
    ],
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    publicationDate:{
        type: String, // Changed to String
        default: () => moment().format("MMM D, YYYY") 
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
