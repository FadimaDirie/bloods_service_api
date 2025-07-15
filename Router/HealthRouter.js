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
router.post('/health', async (req, res) => {
    const items = req.body;
  
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Checklist items are required' });
    }
  
    try {
      const inserted = await HealthChecklist.insertMany(items);
      res.status(201).json({ message: 'Checklist saved', data: inserted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });


module.exports = router;
