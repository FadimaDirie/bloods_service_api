const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  phone: { type: String, required: true, unique: true },
  location: { type: String },
  bloodType: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String }, // no unique, no required
  roles: {
    isDonor: { type: Boolean, default: false },
    isRequester: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
