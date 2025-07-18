const express = require('express');
const router = express.Router();
const LoginLog = require('../models/LoginLog');

// GET total login logs
router.get('/login-count', async (req, res) => {
  try {
    const total = await LoginLog.countDocuments();
    res.json({ success: true, totalLoginTransactions: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
