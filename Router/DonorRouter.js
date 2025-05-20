const express = require('express');
const DonorRouter = express.Router();
const Donor = require('../models/donor')

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

// GET donors by blood group
DonorRouter.get('/api/donor/group/:bloodGroup', async (req, res) => {
  try {
    const bloodGroup = req.params.bloodGroup;
    const donors = await Donor.find({ bloodGroup: bloodGroup });
    res.status(200).json(donors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = DonorRouter;
