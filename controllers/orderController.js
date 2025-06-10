const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { requesterId, donorId, bloodType } = req.body;

    if (!requesterId || !donorId || !bloodType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = new Order({ requesterId, donorId, bloodType });
    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
