const express = require('express');
const router = express.Router();

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications');
const isLoggedIn = require('../middlewares/isloggedIn');

router.post('/posts/:postId/save',isLoggedIn, async (req, res, next) => {

    const { postId } = req.params;
    const savedCollection = await Save.findOne({ user: req.user._id });
    const isSaved = savedCollection.posts.some(p => p.equals(postId));

    if (!isSaved) {
        savedCollection.posts.push(postId);
        await savedCollection.save();
        res.send(JSON.stringify('saved'));
    } else {
        savedCollection.posts.pull(postId);
        await savedCollection.save();
        res.send(JSON.stringify('unsaved'));
    }
});

module.exports = router;