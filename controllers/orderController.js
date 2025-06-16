const Order = require('../models/Order');
const admin = require('../firebase');
const User = require('../models/User');

// ✅ Create a new blood order
exports.createOrder = async (req, res) => {
  try {
    const { requesterId, donorId, bloodType, unit, hospitalName, patientName } = req.body;

    if (!requesterId || !donorId || !bloodType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save the order with new fields
    const order = new Order({
      requesterId,
      donorId,
      bloodType,
      unit,
      hospitalName,
      patientName
    });
    await order.save();

    // Notify donor if token exists
    const donorUser = await User.findById(donorId);

    if (donorUser?.fcmToken) {
      const message = {
        notification: {
          title: '🩸 Blood Request',
          body: `You have a new request for ${bloodType} (${unit ?? 1} unit) for ${patientName ?? 'a patient'}.`,
        },
        token: donorUser.fcmToken,
        android: {
          notification: { sound: 'default', channelId: 'high_importance_channel' },
        },
        apns: {
          payload: { aps: { sound: 'default' } },
        },
      };

      try {
        await admin.messaging().send(message);
        console.log('✅ Notification sent to donor');
      } catch (fcmErr) {
        console.error('❌ FCM Error:', fcmErr.code, '-', fcmErr.message);
        if (fcmErr.code === 'messaging/registration-token-not-registered') {
          await User.findByIdAndUpdate(donorId, { $unset: { fcmToken: 1 } });
          console.warn('⚠️ Invalid FCM token removed from donor record');
        }
      }
    } else {
      console.log('ℹ️ Donor has no valid FCM token');
    }

    res.status(201).json({ message: 'Order placed', order });

  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get all orders where user is requester or donor
exports.getMyOrders = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in URL params' });
  }

  try {
    const orders = await Order.find({
      $or: [{ requesterId: userId }, { donorId: userId }]
    })
    .populate('requesterId', 'fullName email phone bloodType location')
    .populate('donorId', 'fullName email phone bloodType location')
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

// ✅ Update order status (accepted or rejected)
exports.updateOrderStatus = async (req, res) => {
  const { orderId, status, userId } = req.body;

  if (!orderId || !status || !userId) {
    return res.status(400).json({ message: 'Missing orderId, userId, or status' });
  }

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get orders I requested (requesterId == userId)
exports.getMyRequestedOrders = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }

  try {
    const requestedOrders = await Order.find({ requesterId: userId })
      .populate('requesterId', 'fullName email phone bloodType location')
      .populate('donorId', 'fullName email phone bloodType location')
      .sort({ createdAt: -1 });

    const classifyByStatus = (ordersList) => ({
      total: ordersList.length,
      accepted: ordersList.filter(o => o.status === 'accepted'),
      rejected: ordersList.filter(o => o.status === 'rejected'),
      waiting:  ordersList.filter(o => o.status === 'waiting'),
    });

    res.status(200).json({
      message: 'My requested orders retrieved successfully',
      ...classifyByStatus(requestedOrders)
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get orders requested from me (donorId == userId)
exports.getOrdersRequestedFromMe = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }

  try {
    const receivedOrders = await Order.find({ donorId: userId })
      .populate('requesterId', 'fullName email phone bloodType location')
      .populate('donorId', 'fullName email phone bloodType location')
      .sort({ createdAt: -1 });

    const classifyByStatus = (ordersList) => ({
      total: ordersList.length,
      accepted: ordersList.filter(o => o.status === 'accepted'),
      rejected: ordersList.filter(o => o.status === 'rejected'),
      waiting:  ordersList.filter(o => o.status === 'waiting'),
    });

    res.status(200).json({
      message: 'Orders requested from me retrieved successfully',
      ...classifyByStatus(receivedOrders)
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
