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
    date:{
        type:Date,
        default:Date.now
    },
    publicationDate:{
        type: String,
        default: () => moment().format("MMM D, YYYY") 
    },
    avatar:{
        type:String,
        default:"https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg"
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
