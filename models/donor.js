const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  healthStatus: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  availability: { type: String, required: true },
  lastDonationDate: { type: Date, required: true },
  weight: { type: Number, required: true },
  age: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
