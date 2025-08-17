const express = require('express');
const router = express.Router();
const LoginLog = require('../models/LoginLog');

// GET total login logs
router.get('/login-logs', async (req, res) => {
  const logs = await LoginLog.find().sort({ timestamp: -1 });
  res.json({ success: true, logs });
});


module.exports = router;
