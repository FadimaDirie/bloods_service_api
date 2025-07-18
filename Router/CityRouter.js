// Router/CityRouter.js
const express = require('express');
const router = express.Router();
const City = require('../models/City');

// ✅ GET all cities
router.get('/allcities', async (req, res) => {
  try {
    const cities = await City.find({}, 'name'); // only return name field
    res.status(200).json(cities);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ POST new city


router.post('/cities', async (req, res) => {
  const cities = req.body;

  if (!Array.isArray(cities) || cities.length === 0) {
    return res.status(400).json({ message: 'City list is required' });
  }

  try {
    const inserted = await City.insertMany(cities);
    res.status(201).json({ message: 'Cities added successfully', data: inserted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
