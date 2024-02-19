const express = require('express');
const app = express();
const PORT = 8000;

const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const Post = require('./models/post');
const User = require('./models/user');
const Comment = require('./models/comments');
const Save = require('./models/saved');
const Follow = require('./models/followers');
const Notification = require('./models/notifications')

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

//temp middleware

app.use((req, res, next) => {
    req.user = { _id: "65d34006c19de809f324ae6e", name: "sarjeet" };
    next();
})
const attachUserId = (req, res, next) => {
    if (req.user) {
        res.locals.userId = req.user._id;
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
app.get('/', (req, res, next) => {
    try {
        res.render('posts/home.ejs')
    } catch (err) {
        throw new appError('Internal Server Error', 500);
    }
})

app.get('/posts', async (req, res, next) => {
    try {
        const posts = await Post.find({});
        res.render('posts/index', { posts, xyz: "hehe" },)
    } catch (err) {
        next(new appError('Internal Server Error', 500));
    }
})

app.post('/posts', async (req, res, next) => {
    try {
        const { post } = req.body;
        const tags = post.tags.split(",");
        const newPost = new Post({
            title: post.title,
            content: post.content,
            tags: tags,
            viewsCount: 0,
            likesCount: 0,
            CommentCount: 0,
            author: req.user.name,
            owner: req.user._id
        })
        await newPost.save();
        res.redirect(`/posts/${newPost._id}`);
    } catch (err) {
        next(new appError('Internal Server Error', 500));
    }
})

app.get('/posts/new', async (req, res, next) => {
    try {
        res.render('posts/new');
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})

app.get('/posts/saved', async (req, res, next) => {
    try {
        const saved = await Save.findOne({ user: req.user._id }).populate('posts');
        res.render('posts/saved', { saved: saved.posts });
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }

});



app.get('/posts/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id)
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    model: 'User'
                }
            });
        const comments = post.comments;
        const follow = await Follow.findOne({ user: req.user._id }).populate('following');
        const followingList = follow.following;
        const collection = await Save.findOne({
            user: req.user._id
        });

        const isFollowing = followingList.some(user => post.owner);
        console.log(isFollowing);
        const isSave = collection ? collection.posts.some(i => i.equals(id)) : false;

        res.render('posts/show', { post, comments, saveButtonText: isSave ? "unsave" : "save", followButtonText: isFollowing ? "unfollow" : "follow" })
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})

app.put('/posts/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { post } = req.body;
        const oldPost = await Post.findById(id);
        oldPost.title = post.title;
        oldPost.content = post.content;
        oldPost.tags = post.tags;
        await oldPost.save();
        res.redirect(`/posts/${id}`);
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})

app.delete('/posts/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await Post.findByIdAndDelete({ _id: id });
        res.redirect('/posts');
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})

app.get('/posts/:id/edit', async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post.findById({ _id: id });
        res.render('posts/edit', { post })
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})

app.post('/posts/:id/comment', reduceNotifications, async (req, res, next) => {
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

app.delete('/posts/:postId/comments/:commentId/delete', async (req, res, next) => {
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

app.get('/user/signup', async (req, res, next) => {
    try {
        res.render('users/signup');
    } catch (err) {
        throw new appError('Internal Server Error', 500)
    }
})
app.post('/user/signup', async (req, res, next) => {
    // try {
    const user = req.body;
    const newUser = new User({
        name: user.name,
        email: user.email,
        password: user.password
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
app.post('/posts/:postId/like', reduceNotifications, async (req, res, next) => {
    // try {
    const { postId } = req.params;
    console.log('clicked')
    const currPost = await Post.findById(postId).populate('owner');
    let totalLikes = currPost.likes.length;
    console.log(totalLikes);
    const isLiked = currPost.likes.some(like => like.equals(req.user._id));
    console.log(isLiked)
    if (!isLiked) {
        currPost.likes.push(req.user._id);
        await currPost.save();
        totalLikes += 1;
        const notification = await Notification.findOne({ userId: currPost.owner._id });
        console.log(notification);
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
    console.log(totalLikes);
    res.send(JSON.stringify(totalLikes));
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
});
app.post('/posts/:postId/save', async (req, res, next) => {
    try {
        const { postId } = req.params;
        const savedCollection = await Save.findOne({ user: req.user._id });

        if (savedCollection) {
            const isSaved = savedCollection.posts.some(p => p.equals(postId));

            if (!isSaved) {
                savedCollection.posts.push(postId);
                await savedCollection.save();
                res.send(JSON.stringify('saved'));
            } else {
                savedCollection.posts.pull(postId);
                await savedCollection.save();
                res.send(JSON.stringify('unsaved'));
            }
        } else {
            const col = new Save({
                user: req.user._id,
                post: [postId]
            });

            await col.save(); // Make sure to await the save operation
            res.send(JSON.stringify('saved'));
        }
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
});

app.post('/user/:authorId/follow', reduceNotifications, async (req, res, next) => {
    // try {
    const { authorId } = req.params;
    const data_userSide = await Follow.findOne({ user: req.user._id }).populate('following');
    const data_authorSide = await Follow.findOne({ user: authorId }).populate('followedBy');

    const isFollowing = data_userSide.following.some(i => i.equals(authorId));
    // console.log(isFollowing);

    if (isFollowing) {
        await data_userSide.following.pull(authorId);
        await data_authorSide.followedBy.pull(req.user._id);
        await data_userSide.save();
        await data_authorSide.save();
        res.send(JSON.stringify('unfollowed'));
    } else {
        data_userSide.following.push(authorId);
        data_authorSide.followedBy.push(req.user._id);
        await data_userSide.save();
        await data_authorSide.save();

        const notification = await Notification.findOne({ userId: authorId });
        console.log(notification);
        // Push a new notification into the Notification array
        notification.notifications.push({
            postId: null,
            actionBy: req.user._id,
            notificationType: 'follow',
            checked: false,
        });
        // Save the updated notification document
        await notification.save();

        res.send(JSON.stringify('followed'));
    }
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
});

app.get('/user/profile', async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user._id })
        const myPosts = await Post.find({ owner: user._id })
        const followers = await Follow.findOne({ user: user._id }).populate('following').populate('followedBy');
        console.log(followers);
        res.render('users/profile', { user, myPosts, followers: followers.followedBy, following: followers.following });
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }

})
app.get('/user/followers', async (req, res, next) => {
    try {
        const followers = await Follow.findOne({ user: req.user._id }).populate('followedBy');
        res.render('users/followers', { followers: followers.followedBy });
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})
app.get('/user/following', async (req, res, next) => {
    try {
        const followings = await Follow.findOne({ user: req.user._id }).populate('following');
        res.render('users/following', { followings: followings.following });
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})
app.get('/user/notifications', async (req, res, next) => {
    const data = await Notification.findOne({ userId: req.user._id }).populate({
        path: 'notifications',
        populate: [
            { path: 'actionBy', model: 'User' },
            { path: 'postId', model: 'Post' }
        ]
    });
    const notifications = data.notifications;
    data.notifications = []
    data.save();
    res.render('posts/notification', { notifications });
})
app.get('/user/:userId/notifications', async (req, res) => {
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

        const notifications = data.notifications;
        // console.log(notifications);

        res.send(JSON.stringify(notifications));
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Internal Server Error');
    // }
});


app.all('*', (req, res, next) => {
    next(new appError('wrong path', 404));
})
app.use((err, req, res, next) => {
    const { status = 500, message = 'internal server error' } = err;
    res.status(status).send(message)
    next(err);
})

app.listen(PORT, () => {
    console.log("listening at port 3000");
})