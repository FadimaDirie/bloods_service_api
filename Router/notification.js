const express = require('express');
const router = express.Router();
const axios = require('axios');

// FCM Server Key
const FCM_SERVER_KEY = 'YOUR_FIREBASE_SERVER_KEY'; // Replace this with your key

router.post('/send', async (req, res) => {
  const { token, title, body } = req.body;

  try {
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: token,
        notification: {
          title,
          body,
        }
      },
      {
        headers: {
          Authorization: `key=${FCM_SERVER_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ msg: 'Notification sent', fcmResponse: response.data });
  } catch (error) {
    console.error('FCM Error:', error.message);
    res.status(500).json({ msg: 'FCM error', error: error.message });
  }
});

module.exports = router;
