const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: false },
  age: { type: Number },
  phone: { type: String, required: true, unique: true },
  gender: { type: String }, // ✅ gender field added
  city: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  bloodType: { type: String },
  username: { type: String, required: flase, },
  password: { type: String, required: true },
  profilePic: { type: String },
  fcmToken: { type: String },
  roles: {
    isDonor: { type: Boolean, default: false },
    isRequester: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
