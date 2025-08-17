const crypto = require('crypto');
const LoginLog = require('../models/LoginLog');

async function logToBlockchain(userId) {
  try {
    // 1. Ka hel log-kii ugu dambeeyay
    const lastLog = await LoginLog.findOne().sort({ timestamp: -1 });

    const previousHash = lastLog ? lastLog.hash : "GENESIS_BLOCK";

    // 2. Samee string la hash-gareynayo
    const dataToHash = `${userId}-${Date.now()}-${previousHash}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // 3. Samee log cusub
    const log = new LoginLog({
      userId,
      hash,
      previousHash
    });

    // 4. Save MongoDB
    await log.save();

    console.log(`[BLOCKCHAIN SIMULATION] ✅ User ${userId} logged in at ${log.timestamp}`);
    console.log(`   Hash: ${hash}`);
    console.log(`   Previous: ${previousHash}`);

  } catch (err) {
    console.error('Blockchain logging failed:', err.message);
  }
}

module.exports = { logToBlockchain };
