const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, unique: true },
  phone: { type: String, unique: true },
  location: { type: String, unique: true },
  bloodType: { type: String, unique: true },
  username: { type: String, unique: true },
  password: { type: String, unique: true },
  profilePic: { type: String, unique: true },
  roles: {
    isDonor: { type: Boolean, default: false },
    isRequester: { type: Boolean, default: false }
  }
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
