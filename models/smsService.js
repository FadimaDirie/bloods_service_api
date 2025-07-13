const axios = require('axios');

const USERNAME = 'Bloodapp';
const PASSWORD = 'Bloodapp$(03)';
const BASE_URL = 'https://tabaarakict.so/SendSMS.aspx';

/**
 * Sends SMS using Tabaarak URL-based GET API
 * @param {string} message - The message (must be 10+ chars)
 * @param {string[]} phoneNumbers - Array of recipient numbers (e.g., ['618123456'])
 */
const sendSMS = async (message, phoneNumbers = []) => {
  if (!message || message.length < 10) {
    console.error('❌ SMS message must be at least 10 characters.');
    return;
  }

  for (const phone of phoneNumbers) {
    const fullURL = `${BASE_URL}?user=${encodeURIComponent(USERNAME)}&pass=${encodeURIComponent(PASSWORD)}&cont=${encodeURIComponent(message)}&rec=${phone}`;
    
    try {
      console.log('📤 Sending SMS via URL:', fullURL);
      const res = await axios.get(fullURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Node.js)', // mimic browser if needed
        },
        timeout: 8000,
      });

      const result = res.data?.Result?.Message || JSON.stringify(res.data);
      console.log(`✅ SMS sent to ${phone}:`, result);
    } catch (err) {
      console.error(`❌ Failed to send SMS to ${phone}:`, err.response?.data || err.message);
    }
  }
};

module.exports = { sendSMS };
