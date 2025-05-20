const express = require('express');
const RequestBloodRouter = express.Router();
const BloodRequest = require('../models/BloodRequest');

// POST create new blood request
RequestBloodRouter.post('/request', async (req, res) => {
  try {
    const newRequest = new BloodRequest(req.body);
    await newRequest.save();
    res.status(201).json({ message: 'Blood request submitted successfully', data: newRequest });
  } catch (error) {
    console.error('❌ Blood request error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET all blood requests (optional)
RequestBloodRouter.get('/request', async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error });
  }
});

module.exports = RequestBloodRouter;
