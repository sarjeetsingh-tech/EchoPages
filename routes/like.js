const express = require('express');
const router = express.Router();

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications')
const reduceNotifications=require('../utils/reduceNotification')
const isloggedIn=require('../middlewares/isloggedIn');

router.post('/posts/:postId/like',isloggedIn, async (req, res, next) => {

    const { postId } = req.params;
    const currPost = await Post.findById(postId).populate('owner');
    let totalLikes = currPost.likes.length;
    const isLiked = currPost.likes.some(like => like.equals(req.user._id));

    if (!isLiked) {
        currPost.likes.push(req.user._id);
        await currPost.save();
        totalLikes += 1;
        const notification = await Notification.findOne({ userId: currPost.owner._id });

        notification.notifications.push({
            postId: postId,
            actionBy: req.user._id,
            notificationType: 'like',
            checked: false,
        });

        await notification.save();
    } else {
        totalLikes -= 1;
        await Post.updateOne({ _id: postId }, { $pull: { likes: req.user._id } });
    }
    res.send(JSON.stringify(totalLikes));

});

module.exports = router;