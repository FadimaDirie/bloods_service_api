// Router/CityRouter.js
const express = require('express');
const router = express.Router();
const City = require('../models/City');

// ✅ GET all cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.find({}, 'name'); // only return name field
    res.status(200).json(cities);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ POST new city
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'City name is required' });
  }

  try {
    const existing = await City.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'City already exists' });
    }

    const city = new City({ name });
    await city.save();

    res.status(201).json({ message: 'City created', city });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
