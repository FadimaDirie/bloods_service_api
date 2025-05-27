const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  phone: { type: String, required: true, unique: true },
  city: { type: String },                    // ✅ city name
  latitude: { type: Number },                // ✅ latitude for maps
  longitude: { type: Number },               // ✅ longitude for maps
  bloodType: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String },
  fcmToken: { type: String },
  roles: {
    isDonor: { type: Boolean, default: false },
    isRequester: { type: Boolean, default: true}
  },
 
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
