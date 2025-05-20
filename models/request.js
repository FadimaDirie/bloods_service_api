const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  bloodGroup: { type: String, required: true },
  unit: { type: String, required: true },
  requirement: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  hospital: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
