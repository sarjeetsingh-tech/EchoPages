const express = require('express');
const router = express.Router();

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications')

router.post('/posts/:postId/save', async (req, res, next) => {
    // try {
    const { postId } = req.params;
    const savedCollection = await Save.findOne({ user: req.user._id });

    if (savedCollection) {
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
    } else {
        const col = new Save({
            user: req.user._id,
            post: [postId]
        });

        await col.save(); // Make sure to await the save operation
        res.send(JSON.stringify('saved'));
    }
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
});

module.exports = router;