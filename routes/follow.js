const express = require('express');
const router = express.Router();

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications')
const reduceNotifications = require('../utils/reduceNotification')

router.post('/user/:authorId/follow', async (req, res, next) => {
    try {
        const { authorId } = req.params;

        let data_userSide = await Follow.findOne({ user: req.user._id });

        if (!data_userSide) {
            data_userSide = new Follow({ user: req.user._id, followings: [], followers: [] });
            await data_userSide.save();
        }

        let data_authorSide = await Follow.findOne({ user: authorId });

        // If the follow data for the author doesn't exist, create a new document
        if (!data_authorSide) {
            data_authorSide = new Follow({ user: authorId, followings: [], followers: [] });
            await data_authorSide.save();
        }


        const isFollowing = data_userSide.followings && data_userSide.followings.some(i => i.equals(authorId));

        if (isFollowing) {
            if (data_userSide.followings) {
                await data_userSide.followings.pull(authorId);
            }
            if (data_authorSide.followers) {
                await data_authorSide.followers.pull(req.user._id);
            }
            await Promise.all([data_userSide.save(), data_authorSide.save()]);
            return res.send(JSON.stringify('unfollowed'));
        } else {
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




module.exports = router;