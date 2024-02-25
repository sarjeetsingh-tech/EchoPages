require('dotenv').config()

const express = require('express');
const app = express();
const PORT = 3000;

const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const session = require('express-session')
const flash = require('express-flash');
const Post = require('./models/post');
const User = require('./models/user');
const Comment = require('./models/comments');
const Save = require('./models/saved');
const Follow = require('./models/followers');
const Notification = require('./models/notifications')
const cleanupExpiredNotifications = require('./utils/notificationCleanup');

setInterval(async () => {
    try {
        console.log('Cleaning up expired notifications...');
        await cleanupExpiredNotifications();
        console.log('Expired notifications cleaned up successfully.');
    } catch (error) {
        console.error('Error cleaning up expired notifications:', error);
    }
}, 12 * 60 * 60 * 1000);

const homeRoute = require('./routes/home')
const postRoute = require('./routes/posts')
const commentRoute = require('./routes/comments')
const likeRoute = require('./routes/like')
const saveRoute = require('./routes/save')
const userRoute = require('./routes/user')
const followRoute = require('./routes/follow')
const userUtilRoute = require('./routes/userUtils')

const appError = require('./appError')

mongoose.connect('mongodb://127.0.0.1:27017/echopages')
    .then(() => console.log('connected'))
    .catch(err => console.log('connection error'))

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(express.static('public'))


//authentication--------------------------------
const passport = require('passport');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Change to false if not using HTTPS
        expires: new Date(Date.now() + 1000 * 60 * 60),
        maxAge: 1000 * 60 * 60, // or expires: new Date(Date.now() + 1000 * 60 * 60)
        httpOnly: true
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});



const LocalStrategy = require('passport-local').Strategy;
passport.use('local', new LocalStrategy(User.authenticate()));

const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google',
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                profilePicture: profile.photos[0].value, // Save profile picture URL
            });
            await user.save();
        }
        done(null, user);
    } catch (err) {
        done(err);
    }
}));

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

app.get('/login/federated/google', passport.authenticate('google'));
// app.get('/oauth2/redirect/google', passport.authenticate('google', {
//     successRedirect: '/posts',
//     failureRedirect: '/user/login'
// }));
app.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/posts',
    failureRedirect: '/user/login'
}), async (req, res) => {
    try {
        const { _id } = req.user;
        await createInitialInstances(_id);
        res.redirect('/posts');
    } catch (error) {
        console.error('Error creating initial instances:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.use((req,res,next)=>{
    console.log(req.isAuthenticated());
    next();
})

app.use((req, res, next) => {
    console.log(req.user);
    res.locals.successFlash = req.flash('success');
    res.locals.errorFlash = req.flash('error');
    res.locals.isloggedIn=req.isAuthenticated();
    next();
})

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Expires', '0');
    next();
});


const attachUserId = (req, res, next) => {
    if (req.user) {
        res.locals.userId = req.user._id;
        res.locals.userName = req.user.username;
        res.locals.userEmail = req.user.email;
    } else {
        res.locals.userId = '1';
        res.locals.userName = 'Guest';
        res.locals.userEmail = null;
    }
    next();
};
app.use(attachUserId);

app.use('/', homeRoute);
app.use('/', postRoute);
app.use('/', commentRoute)
app.use('/', likeRoute)
app.use('/', saveRoute)
app.use('/', userRoute);
app.use('/', followRoute);
app.use('/', userUtilRoute)

// app.all('*', (req, res, next) => {
//     next(new appError('wrong path', 404));
// })
app.use((err, req, res, next) => {
    const { status = 500, message = 'internal server error' } = err;
    res.status(status).send(message)
    next(err);
})

app.listen(PORT, () => {
    console.log("listening at port 3000");
})