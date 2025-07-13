// smsService.js
const axios = require('axios');

const SMS_API_URL = 'https://sms.tabaarak.com';
const USERNAME = 'Bloodapp';
const PASSWORD = 'Bloodapp$(03)'; // ← use your actual credentials

let token = null;

// Get and cache the token
const getAuthToken = async () => {
  if (token) return token;
  try {
    const res = await axios.post(`${SMS_API_URL}/Auth/SMSLogin`, {
      Name: USERNAME,
      Password: PASSWORD,
    });
    token = res.data.data.token;
    return token;
  } catch (error) {
    console.error('❌ Error getting SMS token:', error.response?.data || error.message);
    return null;
  }
};

// Send SMS message
const sendSMS = async (message, phoneNumbers = []) => {
  try {
    const token = await getAuthToken();
    if (!token) return;

    const payload = {
      smsMessage: message,
      mobile: phoneNumbers,
    };

    const response = await axios.post(`${SMS_API_URL}/Sms/sendsms`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ SMS response:', response.data);
  } catch (error) {
    console.error('❌ SMS sending error:', error.response?.data || error.message);
  }
};

module.exports = { sendSMS };
