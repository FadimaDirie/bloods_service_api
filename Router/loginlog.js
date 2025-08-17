const express = require('express');
const router = express.Router();
const LoginLog = require('../models/LoginLog');

// GET total login logs
router.get('/login-logs', async (req, res) => {
  const logs = await LoginLog.find().sort({ timestamp: -1 });
  res.json({ success: true, logs });
});

// ✅ GET total blockchain transactions
router.get('/total-transactions', async (req, res) => {
  try {
    const total = await LoginLog.countDocuments(); // tirada blocks/logs
    res.json({ success: true, totalTransactions: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
