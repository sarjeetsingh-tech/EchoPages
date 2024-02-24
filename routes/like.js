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

router.post('/posts/:postId/like', reduceNotifications, async (req, res, next) => {
    // try {
    const { postId } = req.params;
    // console.log('clicked')
    const currPost = await Post.findById(postId).populate('owner');
    let totalLikes = currPost.likes.length;
    // console.log(totalLikes);
    const isLiked = currPost.likes.some(like => like.equals(req.user._id));
    // console.log(isLiked)
    if (!isLiked) {
        currPost.likes.push(req.user._id);
        await currPost.save();
        totalLikes += 1;
        const notification = await Notification.findOne({ userId: currPost.owner._id });
        // console.log(notification);
        // Push a new notification into the Notification array
        notification.notifications.push({
            postId: postId,
            actionBy: req.user._id,
            notificationType: 'like',
            checked: false,
        });
        // Save the updated notification document
        await notification.save();
    } else {
        totalLikes -= 1;
        await Post.updateOne({ _id: postId }, { $pull: { likes: req.user._id } });
    }
    // console.log(totalLikes);
    res.send(JSON.stringify(totalLikes));
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
});

module.exports = router;