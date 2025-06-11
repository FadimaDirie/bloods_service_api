const express = require('express');
const DonorRouter = express.Router();
const Donor = require('../models/donor')
const User = require('../models/User');   // your User model

// POST /api/donors
DonorRouter.post('/donors', async (req, res) => {
  try { 
    const newDonor = new Donor(req.body);
    const saved = await newDonor.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/donor/donors/group/:bloodType
DonorRouter.get('/donors/group/:bloodType', async (req, res) => {
  try {
    const donors = await User.find({
      isDonor: true,
      bloodType: req.params.bloodType
    }).select({
      fullName: 1,
      email: 1,
      age: 1,
      phone: 1,
      gender: 1,
      city: 1,
      latitude: 1,
      longitude: 1,
      bloodType: 1,
      username: 1,
      profilePic: 1,
      fcmToken: 1,
      isDonor: 1,
      isRequester: 1,
      createdAt: 1,
      updatedAt: 1
    });

    res.status(200).json(donors);
  } catch (err) {
    console.error('Error fetching donors:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});



module.exports = DonorRouter;
