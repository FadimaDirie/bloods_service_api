const express = require('express');
const RequestBloodRouter = express.Router();
const BloodRequest = require('../models/request');
const User = require('../models/User');
const admin = require('../firebase');


// POST create new blood request


// GET all blood requests
RequestBloodRouter.get('/all', async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error });
  }
});

// POST: Create a blood request
RequestBloodRouter.post('/request', async (req, res) => {
  const {
    bloodGroup, unit, urgency, status,
    name, age, phone, hospital, location
  } = req.body;

  // ❗ Server-side validation
  if (!bloodGroup || !unit || !urgency || !status || !name || !age || !phone || !hospital || !location) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const request = new BloodRequest({
      bloodGroup, unit, urgency, status,
      name, age, phone, hospital, location
    });

    await request.save();
    res.status(201).json({ message: "Request saved successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = RequestBloodRouter;
