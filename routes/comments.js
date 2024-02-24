const express=require('express');
const router=express.Router();

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications')
const reduceNotifications=require('../utils/reduceNotification')

router.post('/posts/:id/comment', reduceNotifications, async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: req.user._id });
        const post = await Post.findById({ _id: id }).populate('owner');
        // console.log(post.owner._id);

        // Find or create the notification document for the post owner
        let notification = await Notification.findOne({ userId: post.owner._id });
        if (!notification) {
            notification = new Notification({
                userId: post.owner._id,
                notifications: [] // Initialize an empty array
            });
        }

        // Push a new notification into the Notification array
        notification.notifications.push({
            postId: id,
            actionBy: req.user._id,
            notificationType: 'comment',
            checked: false,
        });
        // Save the updated notification document
        await notification.save();

        // console.log(post);

        const newComment = new Comment({
            comment: req.body.comment,
            user: user
        });

        await newComment.save();

        post.comments.push(newComment);
        await post.save();

        res.send(JSON.stringify([newComment, user.name]));
    } catch (err) {
        next(new appError('Internal Server Error', 500));
    }
});
router.delete('/posts/:postId/comments/:commentId/delete', async (req, res, next) => {
    // console.log('deleted');
    // try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findOne({ _id: commentId });
    const post = await Post.findOne({ _id: postId }).populate({
        path: 'comments',
        populate: {
            path: 'user',
            model: 'User'
        }
    });
    if (req.user._id == comment.user) {

        post.comments.pull(commentId);
        post.save();
        await Comment.findOneAndDelete({ _id: commentId });
        res.send(JSON.stringify('deleted'));
    }
    else res.send(JSON.stringify('failed'))
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
})
module.exports=router;