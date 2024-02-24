const express = require('express');
const router = express.Router();

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications')

router.get('/user/:userId/profile', async (req, res, next) => {
    // try {
    if(!req.session.userId)return res.redirect('/user/signup')
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId })
    const myPosts = await Post.find({ owner: user._id })
    const followsData = await Follow.findOne({ user: user._id }).populate('followings').populate('followers');
    res.render('users/profile', { user, myPosts, followers: followsData.followers, following: followsData.followings });
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }

})
router.get('/user/:id/followers', async (req, res, next) => {
    // try {
    const { id } = req.params;
    const followersData = await Follow.findOne({ user: id }).populate('followers');
    res.render('users/followers', { followers: followersData.followers });
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
})
router.get('/user/:id/following', async (req, res, next) => {
    // try {
    const { id } = req.params;
    const followingsData = await Follow.findOne({ user: id }).populate('followings');
    // console.log(followingsData)
    res.render('users/following', { followings: followingsData.followings });
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
})

router.get('/user/:id/followers', async (req, res, next) => {
    // try {
    const { id } = req.params;
    const followersData = await Follow.findOne({ user: id }).populate('followers');
    res.render('users/followers', { followers: followersData.followers });
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
})

router.get('/user/:id/following', async (req, res, next) => {
    // try {
    const { id } = req.params;
    const followingsData = await Follow.findOne({ user: id }).populate('followings');
    // console.log(followingsData)
    res.render('users/following', { followings: followingsData.followings });
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
})
router.get('/user/notifications', async (req, res, next) => {
    const data = await Notification.findOne({ userId: req.user._id }).populate({
        path: 'notifications',
        populate: [
            { path: 'actionBy', model: 'User' },
            { path: 'postId', model: 'Post' }
        ]
    });
    console.log(data);
    if(data==null){
        res.render('posts/notification',{notifications:[]})
    }else{
    const notifications = data.notifications;
    data.notifications = []
    data.save();
    res.render('posts/notification', { notifications });
    }
})

router.get('/user/:userId/notifications', async (req, res) => {
    const { userId } = req.params;
    // try {
    const data = await Notification.findOne({ userId })
        .populate({
            path: 'notifications',
            populate: [
                { path: 'actionBy', model: 'User' },
                { path: 'postId', model: 'Post' }
            ]
        })
        .sort({ 'notifications.createdAt': -1 }) // Sort notifications by createdAt field in descending order
        .limit(5); // Limit the result to 5 notifications
    if(data==null){
        res.send(JSON.stringify([]));
    }
    else{
    const notifications = data.notifications;
    // console.log(notifications);

    res.send(JSON.stringify(notifications));
    }
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Internal Server Error');
    // }
    
});

// router.get('/user/:userId/profile', async (req, res, next) => {
//     // try {
//     // console.log('hey')
//     // console.log(req.session.userId);
//     // console.log('why')
//     // if(req.session.userId==null) return res.redirect('/user/signup');
//     // const { userId } = req.params;
//     // const user = await User.findOne({ _id: userId })
//     // const myPosts = await Post.find({ owner: user._id })
//     // const followsData = await Follow.findOne({ user: user._id }).populate('followings').populate('followers');
//     // res.render('users/profile', { user, myPosts, followers: followsData.followers, following: followsData.followings });
//     // // } catch (err) {
//     //     next(new appError('Internal Server Error', 500))
//     // }

// })

module.exports = router;