const axios = require('axios');

const LOGIN_URL = 'https://sms.tabaarak.com/Auth/SMSLogin';
const SMS_URL = 'https://sms.tabaarak.com/Sms/sendsms';

const USERNAME = 'Bloodapp';
const PASSWORD = 'Bloodapp$(03)';

let token = null;

// Step 1: Authenticate
const getAuthToken = async () => {
  if (token) return token;

  try {
    const res = await axios.post(LOGIN_URL, {
      Name: USERNAME,
      Password: PASSWORD,
    });

    token = res.data.data.token;
    console.log('Got SMS API token');
    return token;
  } catch (err) {
    console.error('Failed to authenticate with Tabaarak SMS API:', err.message);
    return null;
  }
};

// Step 2: Send SMS
const sendSMS = async (message, phoneNumbers = []) => {
  if (!message || message.length < 10) {
    console.error('Message must be at least 10 characters');
    return;
  }

  const token = await getAuthToken();
  if (!token) return;

  try {
    const response = await axios.post(
      SMS_URL,
      {
        smsMessage: message,
        mobile: phoneNumbers,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('SMS sent:', response.data);
  } catch (err) {
    console.error('SMS send error:', err.response?.data || err.message);
  }
};

module.exports = { sendSMS };
