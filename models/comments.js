const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
   comment: String,
   post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post'
   },
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
   }
})
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;