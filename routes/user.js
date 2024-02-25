const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const passport = require('passport');

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications')
const reduceNotifications = require('../utils/reduceNotification')
const initialize = require('../middlewares/initialize')
const createInitialInstances = require('../utils/createInitialInstances');

router.get('/user/signup', async (req, res, next) => {

    res.render('users/signup');

})
router.get('/user/login', async (req, res, next) => {

    res.render('users/login');

})
router.post('/user/login', passport.authenticate('local', { failureRedirect: '/user/login' }), (req, res) => {
    const redirectUrl = '/posts';
    console.log(req.user);
    res.redirect(redirectUrl);
});
router.post('/user/signup', async (req, res, next) => {

    const { username, email, password } = req.body;
    const newUser = new User({
        username,
        email
    })
    await newUser.setPassword(password);
    await newUser.save();
    await createInitialInstances(newUser._id);
    res.redirect('/posts')

})
router.post('/user/signout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/user/login');
    });
})



module.exports = router;