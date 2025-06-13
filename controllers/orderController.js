const Order = require('../models/Order');
const admin = require('../firebase'); // Import your firebase init

exports.createOrder = async (req, res) => {
  try {
    const { requesterId, donorId, bloodType, requesterToken } = req.body;

    if (!requesterId || !donorId || !bloodType || !requesterToken) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = new Order({ requesterId, donorId, bloodType });
    await order.save();

    // 🔔 Send notification
    const message = {
      notification: {
        title: 'Order Confirmation',
        body: 'Your blood order has been placed successfully.',
      },
      token: requesterToken,
    };

    await admin.messaging().send(message);

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