const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications')
const reduceNotifications = require('../utils/reduceNotification')

router.get('/user/signup', async (req, res, next) => {
    // try {
    res.render('users/signup');
    // } catch (err) {
    //     throw new appError('Internal Server Error', 500)
    // }
})
router.get('/user/login', async (req, res, next) => {
    // try {
    res.render('users/login');
    // } catch (err) {
    //     throw new appError('Internal Server Error', 500)
    // }
})
router.post('/user/login',async (req,res)=>{
     const {username,password}=req.body;
    //  console.log(user);
    const user=await User.isValidUser(username,password);
    // console.log(user);
    if(user){
        req.session.userId=user._id;
        res.redirect('/posts');
    }
    else{
        res.redirect('/user/login');
    }
    // console.log(user);
})
router.post('/user/signup', async (req, res, next) => {
    // try {
    const {username,email,password}=req.body;
    const newUser = new User({
        name: username,
        email,
        password
    })
    await newUser.save();
    const newFollowColl = new Follow({
        user: newUser._id,
        following: [],
        followedBy: []
    })
    await newFollowColl.save();
    const newSaveColl = new Save({
        user: newUser._id,
        posts: []
    })
    await newSaveColl.save();
    const newNotificationColl = new Notification({
        userId: newUser._id,
        notifications: []
    })
    await newNotificationColl.save();
    res.redirect('/posts')
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
})
router.post('/user/signout',(req,res)=>{
    req.session.userId=null;
    res.redirect('/user/signup');
})



module.exports = router;