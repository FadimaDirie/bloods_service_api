const Order = require('../models/Order');
const User = require('../models/User');

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

exports.getMyOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({
      $or: [
        { requesterId: userId },
        { donorId: userId }
      ]
    })
    .populate('requesterId', 'name email phone bloodType location')
    .populate('donorId', 'name email phone bloodType location')
    .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders retrieved successfully',
      total: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};