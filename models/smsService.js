// services/smsService.js
const axios = require('axios');

const USERNAME = 'Bloodapp';
const PASSWORD = 'Bloodapp$(03)';
const BASE_URL = 'https://tabaarakict.so/SendSMS.aspx';

/**
 * Sends SMS using Tabaarak GET API
 * @param {string} message - SMS body (must be 10+ characters)
 * @param {string[]} phoneNumbers - e.g. ['618234567']
 */
const sendSMS = async (message, phoneNumbers = []) => {
  if (!message || message.length < 10) {
    console.error('Message must be at least 10 characters');
    return;
  }

  for (const phone of phoneNumbers) {
    const url = `${BASE_URL}?user=${encodeURIComponent(USERNAME)}&pass=${encodeURIComponent(PASSWORD)}&cont=${encodeURIComponent(message)}&rec=${phone}`;
    
    try {
      console.log(' Sending to:', phone);
      console.log('URL:', url);

      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Node.js)',
        },
        responseType: 'text',
      });

      console.log(`SMS sent to ${phone}. Response:\n`, res.data);
    } catch (err) {
      console.error(`Failed for ${phone}:`, err.response?.data || err.message);
    }
  }
};

module.exports = { sendSMS };
