const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: false },
  age: { type: Number },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['Male', 'Female'] }, // ✅ gender field added
  city: {type: String},
  latitude: { type: Number },
  longitude: { type: Number },
  bloodType: { type: String },
  username: { type: String, required: false },
  password: { type: String, required: true },
  lastDonationDate: {type: Date},
  weight: {type: Number},
  healthStatus: { type: String, enum: ['Healthy', 'Temporarily Ineligible'], default: 'Healthy' },
  healthChecklist: { type: Boolean},
  availability: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
  profilePic: { type: String },
  fcmToken: {
    type: String,
    default: null,
  },
  isDonor: { type: Boolean, default: false },
  isRequester: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false }, 
  isSuspended: { type: Boolean, default: false }, 
  
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
