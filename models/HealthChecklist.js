// models/HealthChecklist.js
const mongoose = require('mongoose');

const HealthChecklistSchema = new mongoose.Schema({
  name: { type: String, required: true } // e.g., "HIV negative"
}, { timestamps: true });

module.exports = mongoose.model('HealthChecklist', HealthChecklistSchema);
