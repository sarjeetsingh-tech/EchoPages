const express = require('express');
const app = express();
const PORT = 3000;

const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const session=require('express-session')
const flash=require('express-flash');
const bcrypt=require('bcrypt');
const Post = require('./models/post');
const User = require('./models/user');
const Comment = require('./models/comments');
const Save = require('./models/saved');
const Follow = require('./models/followers');
const Notification = require('./models/notifications')




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

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Change to false if not using HTTPS
        expires:new Date(Date.now() + 1000 * 60 * 60),
        maxAge: 1000 * 60 * 60, // or expires: new Date(Date.now() + 1000 * 60 * 60)
        httpOnly: true
    }
}));



app.use((req, res, next) => {
    req.user = { _id: "65d780cffde7d5844f2ce78d", name: 'Sarjeet Singh', email: "sarjeetsingh4680@gmail.com" };
    next();
})
app.use((req,res,next)=>{
    res.locals.successFlash=req.flash('success');
    res.locals.errorFlash=req.flash('error');
    next();
})
const attachUserId = (req, res, next) => {
    if (req.user) {
        res.locals.userId = req.user._id;
        res.locals.userName = req.user.name;
        res.locals.userEmail = req.user.email;
    }
    next();
};
app.use(attachUserId);

const reduceNotifications = async function (req, res, next) {
    try {
        const data = await Notification.findOne({ userId: req.user._id });
        if (data.notifications.length > 50) {
            // Sort notifications by createdAt date in ascending order
            data.notifications.sort((a, b) => a.createdAt - b.createdAt);

            // Remove the oldest notification
            data.notifications.shift();
            // Save the updated data
            await data.save();
        }
        next();
    } catch (error) {
        // Handle errors
        next(error);
    }
};
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