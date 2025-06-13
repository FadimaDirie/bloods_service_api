const User = require('../models/User');
exports.updateFCMToken = async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ message: 'Missing userId or fcmToken' });
  }

  try {
    await User.findByIdAndUpdate(userId, { fcmToken });
    res.status(200).json({ message: 'FCM token updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

