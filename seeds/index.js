const mongoose = require('mongoose');
const Post = require('../models/post');
const posts = require('./post');


mongoose.connect('mongodb://127.0.0.1:27017/echopages')
    .then(() => console.log('connected'))
    .catch(err => console.log('connection error'))
Post.deleteMany({}).then(() => {
    const insertPost = async () => {
        const data = await Post.insertMany(posts);
        console.log(data);
    }
    insertPost();
})


