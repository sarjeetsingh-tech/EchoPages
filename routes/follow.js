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

router.post('/user/:authorId/follow', reduceNotifications, async (req, res, next) => {
    try {
        const { authorId } = req.params;
        const data_userSide = await Follow.findOne({ user: req.user._id }).populate('followings');
        const data_authorSide = await Follow.findOne({ user: authorId }).populate('followers');

        // Check if the documents exist
        if (!data_userSide || !data_authorSide) {
            return res.status(404).send("Follow data not found");
        }

        const isFollowing = data_userSide.followings.some(i => i.equals(authorId));
        if (isFollowing) {
            // Unfollow logic
            await data_userSide.followings.pull(authorId);
            await data_authorSide.followers.pull(req.user._id);
            await Promise.all([data_userSide.save(), data_authorSide.save()]);
            return res.send(JSON.stringify('unfollowed'));
        } else {
            // Follow logic
            data_userSide.followings.push(authorId);
            data_authorSide.followers.push(req.user._id);
            await Promise.all([data_userSide.save(), data_authorSide.save()]);

            const notification = await Notification.findOne({ userId: authorId });
            if (notification) {
                notification.notifications.push({
                    postId: null,
                    actionBy: req.user._id,
                    notificationType: 'follow',
                    checked: false,
                });
                await notification.save();
            }

            return res.send(JSON.stringify('followed'));
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});


module.exports=router;