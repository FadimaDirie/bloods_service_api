const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  bloodGroup: { type: String, required: true },
  unit: { type: String, required: true },
  urgency: { type: String, required: true }, // ✅ Added urgency
  status: { type: String, required: true }, // ✅ Added status
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  hospital: { type: String, required: true },
  location: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);