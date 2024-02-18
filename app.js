const express = require('express');
const app = express();
const PORT = 8000;

const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const Post = require('./models/post');
const User = require('./models/user');
const Comment = require('./models/comments')

mongoose.connect('mongodb://127.0.0.1:27017/echopages')
    .then(() => console.log('connected'))
    .catch(err => console.log('connection error'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(express.static('public'))

//temp middleware

app.use((req, res, next) => {
    req.user = 'singh';
    next();
})

app.get('/', (req, res) => {
    res.render('posts/home.ejs')
})

app.get('/posts', async (req, res) => {
    const posts = await Post.find({});
    console.log(req.user);
    res.render('posts/index', { posts },)
})

app.post('/posts', async (req, res) => {
    const { post } = req.body;
    // console.log(req.body)
    const tags = post.tags.split(",");
    const owner = await User.findOne({ name: req.user });
    const newPost = new Post({
        title: post.title,
        content: post.content,
        tags: tags,
        viewsCount: 0,
        likesCount: 0,
        CommentCount: 0,
        author: req.user,
        owner: owner
    })
    await newPost.save();
    res.redirect(`/posts/${newPost._id}`);
})

app.get('/posts/new', (req, res) => {
    res.render('posts/new');

})

app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const comments = await Comment.find({ post: id }).populate('user');
    console.log(comments);
    const post = await Post.findById({ _id: id });
    res.render('posts/show', { post, comments })
})


app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { post } = req.body;
    // console.log(req.body)
    const oldPost = await Post.findById(id);
    // console.log(oldPost);
    oldPost.title = post.title;
    oldPost.content = post.content;
    oldPost.tags = post.tags;
    await oldPost.save();
    res.redirect(`/posts/${id}`);
})
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete({ _id: id });
    res.redirect('/posts');
})

app.get('/posts/:id/edit', async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById({ _id: id });
    res.render('posts/edit', { post })
})

app.post('/posts/:id/comment', async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({ name: 'singh' });
    const post = await Post.findById({ _id: id });
    console.log(req.body);
    const newComment = new Comment({
        comment: req.body.comment,
        post: post,
        user: user
    })
    await newComment.save();
    res.send(JSON.stringify([newComment, user.name]))
})
app.delete('/posts/:postId/comments/:commentId/delete', async (req, res) => {
    // console.log('deleted');
    const { postId, commentId } = req.params;
    await Comment.findOneAndDelete({ post: postId, _id: commentId });
    res.send(JSON.stringify('deleted'));
})

app.get('/user/signup', (req, res) => {
    res.render('users/signup');
})
app.post('/user/signup', async (req, res) => {
    const user = req.body;
    const newUser = new User({
        name: user.name,
        email: user.email,
        password: user.password
    })
    await newUser.save();
    res.redirect('/posts')
})
app.post('/posts/:postId/like', async (req, res) => {
    console.log('liked');
    const { postId } = req.params;
    const currUser = await User.findOne({ name: 'singh' });
    console.log(currUser);
    const currPost = await Post.findById(postId);
    console.log(currPost);
    let totalLikes = currPost.likes.length;
    const isLiked = currPost.likes.some(like => like.equals(currUser._id)); // Check if the user has already liked the post
    if (!isLiked) {
        currPost.likes.push(currUser);
        await currPost.save();
        totalLikes += 1;
    } else {
        totalLikes -= 1;
        await Post.updateOne({ _id: postId }, { $pull: { likes: currUser._id } });
    }

    res.send(JSON.stringify(totalLikes));
});

app.listen(PORT, () => {
    console.log("listening at port 3000");
})