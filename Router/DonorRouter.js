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

// GET /api/donors
DonorRouter.get('/donors', async (req, res) => {
  try {
    const allDonors = await Donor.find();
    res.json(allDonors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET donors by blood group (with user details where isDonor is true)
DonorRouter.get('/donors/group/:bloodGroup', async (req, res) => {
  try {
    const donors = await Donor.aggregate([
      // Match donors by blood group
      { $match: { bloodGroup: req.params.bloodType } },

      // Join with User model on phone field
      {
        $lookup: {
          from: 'users',
          localField: 'phone',
          foreignField: 'phone',
          as: 'userInfo'
        }
      },

      // Flatten the userInfo array
      { $unwind: '$userInfo' },

      // Filter only users who are donors
      { $match: { 'userInfo.roles.isDonor': true } },

      // Select required fields
      {
        $project: {
          fullName: '$userInfo.fullName',
          location: 1,
          bloodGroup: 1,
          fcmToken: '$userInfo.fcmToken',
          email: '$userInfo.email',
          age: '$userInfo.age',
          username: '$userInfo.username',
          phone: '$userInfo.phone',
          profilePic: '$userInfo.profilePic',
          roles: '$userInfo.roles',
          createdAt: '$userInfo.createdAt',
          updatedAt: '$userInfo.updatedAt',
          gender: '$userInfo.gender',
          city: '$userInfo.city',
          latitude: '$userInfo.latitude',
          longitude: '$userInfo.longitude'
        }
      }
    ]);

    res.status(200).json(donors);
  } catch (err) {
    console.error('Error fetching donors:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});




module.exports = DonorRouter;
