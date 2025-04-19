const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    age: Number,
    phone: String,
    location: String,
    bloodType: String,
    username: { type: String, unique: true },
    password: String,
    profilePic: { type: String }
  
});

module.exports = mongoose.model('User', UserSchema);
