const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, unique: true,required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, unique: true,required: true  },
  phone: { type: String, unique: true ,required: true },
  location: { type: String, unique: true ,required: true },
  bloodType: { type: String, unique: true ,required: true },
  username: { type: String, unique: true ,required: true },
  password: { type: String, unique: true ,required: true },
  profilePic: { type: String, unique: true,required: true  },
  roles: {
    isDonor: { type: Boolean, default: false },
    isRequester: { type: Boolean, default: false }
  }
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
