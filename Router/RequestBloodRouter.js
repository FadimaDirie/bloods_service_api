const express = require('express');
const RequestBloodRouter = express.Router();
const BloodRequest = require('../models/request');

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

RequestBloodRouter.post('/request', async (req, res) => {
  try {
    const newRequest = new BloodRequest(req.body);
    await newRequest.save();

    const donors = await User.find({
      'roles.isDonor': true,
      fcmToken: { $ne: null },
      bloodType: req.body.bloodType,
    });

    for (const donor of donors) {
      if (!donor.fcmToken) continue;

      const message = {
        token: donor.fcmToken,
        notification: {
          title: `🩸 ${req.body.bloodType} - Emergency Blood Needed!`,
          body: `👤 ${req.body.patientName} at ${req.body.hospitalName}, ${req.body.location}, needs ${req.body.unit} unit(s)`,
        },
        data: {
          requestId: newRequest._id.toString(),
        },
      };

      await admin.messaging().send(message);
      console.log(`✅ Notification sent to ${donor.fullName}`);
    }

    res.status(201).json({ message: 'Blood request created and notifications sent!' });
  } catch (error) {
    console.error('❌ Blood request error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = RequestBloodRouter;
