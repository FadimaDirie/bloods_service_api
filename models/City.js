// models/City.js
const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // e.g. "Muqdisho", "Hargeisa"
}, { timestamps: true });

module.exports = mongoose.model('City', CitySchema);
