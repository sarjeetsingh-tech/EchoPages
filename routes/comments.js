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
const isloggedIn=require('../middlewares/isloggedIn')

router.post('/posts/:id/comment',isloggedIn, async (req, res, next) => {
 
        const { id } = req.params;
        const user = await User.findOne({ _id: req.user._id });
        const post = await Post.findById({ _id: id }).populate('owner');
        
        let notification = await Notification.findOne({ userId: post.owner._id });

        notification.notifications.push({
            postId: id,
            actionBy: req.user._id,
            notificationType: 'comment',
            checked: false,
        });
        await notification.save();

        const newComment = new Comment({
            comment: req.body.comment,
            user: user
        });

        await newComment.save();

        post.comments.push(newComment);
        await post.save();

        res.send(JSON.stringify([newComment, user.username]));

});
router.delete('/posts/:postId/comments/:commentId/delete',isloggedIn, async (req, res, next) => {

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
})
module.exports=router;