const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, unique: true,required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number},
  phone: { type: String, unique: true ,required: true },
  location: { type: String},
  bloodType: { type: String},
  username: { type: String, unique: true},
  password: { type: String},
  profilePic: { type: String, unique: true,required: true  },
  roles: {
    isDonor: { type: Boolean, default: false },
    isRequester: { type: Boolean, default: false }
  }
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
