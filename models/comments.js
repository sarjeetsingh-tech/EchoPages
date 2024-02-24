const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
   comment: String,
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
   }
})
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
commentSchema.post('findOneAndDelete',async(doc)=>{
   console.log(doc);
})