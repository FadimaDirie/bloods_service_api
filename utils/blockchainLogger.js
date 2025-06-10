const LoginLog = require('../models/LoginLog');

async function logToBlockchain(userId) {
  try {
    const log = new LoginLog({ userId });
    await log.save(); // ✅ THIS stores it in MongoDB
    console.log(`[BLOCKCHAIN SIMULATION] User ${userId} logged in at ${log.timestamp}`);
  } catch (err) {
    console.error('Blockchain logging failed:', err.message);
  }
}

module.exports = { logToBlockchain };
