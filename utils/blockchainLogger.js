// utils/blockchainLogger.js
function logToBlockchain(userId) {
  const timestamp = new Date().toISOString();
  console.log(`[BLOCKCHAIN SIMULATION] User ${userId} logged in at ${timestamp}`);
}

module.exports = { logToBlockchain };
