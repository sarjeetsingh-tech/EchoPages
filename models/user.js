const passportLocalMongoose = require('passport-local-mongoose');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId:String,
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: String ,
    profilePicture:String
})
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema);
module.exports = User;