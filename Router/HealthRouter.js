// Router/HealthChecklistRouter.js
const express = require('express');
const router = express.Router();
const HealthChecklist = require('../models/HealthChecklist');

// ✅ GET all health checks
router.get('/', async (req, res) => {
  try {
    const checks = await HealthChecklist.find({}, 'name');
    res.status(200).json(checks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ POST new health check item
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Checklist name is required' });
  }

  try {
    const existing = await HealthChecklist.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'This checklist item already exists' });
    }

    const newCheck = new HealthChecklist({ name });
    await newCheck.save();

    res.status(201).json({ message: 'Checklist item created', item: newCheck });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
