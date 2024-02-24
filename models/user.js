const mongoose = require('mongoose');
const bcrypt=require('bcrypt');
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})
userSchema.statics.isValidUser = async function (username, password) {
    const user = await User.findOne({ name: username })
    const isValid = await bcrypt.compare(password, user.password);
    return isValid?user:false;
}
userSchema.pre('save',async function(next){
    this.isModified('password');
  this.password=await bcrypt.hash(this.password,12);
  next();
})
const User = mongoose.model('User', userSchema);
module.exports = User;