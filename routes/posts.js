const express = require('express');
const router = express.Router();

const appError = require('../appError')
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comments');
const Save = require('../models/saved');
const Follow = require('../models/followers');
const Notification = require('../models/notifications')

router.get('/posts', async (req, res, next) => {
    try {
        const query = req.query.q;
        const fil = req.query.sort;
        if (query && typeof query === 'string' && query.trim().length > 0) { // Check if query is a non-empty string
            const posts = await Post.find({
                $or: [
                    { author: { $regex: query, $options: 'i' } },
                    { title: { $regex: query, $options: 'i' } }, // Case-insensitive search in title
                    { content: { $regex: query, $options: 'i' } }, // Case-insensitive search in content
                    { tags: { $regex: query, $options: 'i' } } // Case-insensitive search in tags
                ]
            });
            res.render('posts/index', { posts });
        } else if (fil && typeof fil === 'string' && fil.trim().length > 0) {
            if (fil === 'liked') {
                // Sort by number of likes in descending order
                const posts = await Post.find({}).sort({ likes: -1 });
                // console.log(posts);
                res.render('posts/index', { posts });
            } else if (fil === 'old-new') {
                // Sort by publication date from old to new
                const posts = await Post.find({}).sort({ date: 1 });
                // console.log(posts);
                res.render('posts/index', { posts });
            } else if (fil === 'new-old') {
                // Sort by publication date from new to old
                const posts = await Post.find({}).sort({ date: -1 });
                // console.log(posts);
                res.render('posts/index', { posts });
            }
        } else {
            // If no search query provided, retrieve all posts
            const posts = await Post.find({});
            res.render('posts/index', { posts, xyz: "hehe" });
        }
    } catch (err) {
        next(new appError('Internal Server Error', 500));
    }
})

router.post('/posts', async (req, res, next) => {
    // try {
        const { post } = req.body;
        const tags = post.tags.split(",");
        const newPost = new Post({
            title: post.title,
            content: post.content,
            tags: tags,
            viewsCount: 0,
            likesCount: 0,
            CommentCount: 0,
            author: req.user.username,
            owner: req.user._id
        })
        await newPost.save();
        req.flash('success', 'Congratulations! 🎉 Your new page has been created successfully.');
        res.redirect(`/posts/${newPost._id}`);
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500));
    // }
})

router.get('/posts/new', async (req, res, next) => {
    try {
        res.render('posts/new');
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})

router.get('/posts/saved', async (req, res, next) => {
    try {
        const saved = await Save.findOne({ user: req.user._id }).populate('posts');
        console.log(saved);
        res.render('posts/saved', { saved: saved.posts });
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
});


router.get('/posts/:id', async (req, res, next) => {
    // try {
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
    console.log(comments);
    console.log(req.user);
    const follow = await Follow.findOne({ user: req.user._id }).populate('followings');
    let isFollowing = false;
    if (follow != null) {
        const followingList = follow.followings;
        console.log(followingList);
        console.log(post.owner);
        // Check if the post owner's ID exists in the user's following list
        isFollowing = followingList.some(userId => userId.equals(post.owner));
    }
    console.log(isFollowing);
    let isSave = false;
    const collection = await Save.findOne({
        user: req.user._id
    });

    if (collection != null) {
        isSave = collection ? collection.posts.some(i => i.equals(id)) : false;
    }
    res.render('posts/show', { post, comments, saveButtonText: isSave ? "unsave" : "save", followButtonText: isFollowing ? "unfollow" : "follow" })
    // } catch (err) {
    //     next(new appError('Internal Server Error', 500))
    // }
})

router.put('/posts/:id', async (req, res, next) => {
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

router.delete('/posts/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await Post.findByIdAndDelete({ _id: id });
        res.redirect('/posts');
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})

router.get('/posts/:id/edit', async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post.findById({ _id: id });
        res.render('posts/edit', { post })
    } catch (err) {
        next(new appError('Internal Server Error', 500))
    }
})

module.exports = router;
