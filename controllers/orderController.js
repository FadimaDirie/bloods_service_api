const Order = require('../models/Order');
const admin = require('../firebase'); // Import your firebase init
const User = require('../models/User'); // ✅ Make sure to import User model
exports.createOrder = async (req, res) => {
  try {
    const { requesterId, donorId, bloodType } = req.body;

    if (!requesterId || !donorId || !bloodType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ Create the order first
    const order = new Order({ requesterId, donorId, bloodType });
    await order.save();

    // ✅ Look up the donor's FCM token
    const donorUser = await User.findById(donorId);

    if (donorUser && donorUser.fcmToken) {
      const donorToken = donorUser.fcmToken;

      const message = {
        notification: {
          title: '🩸 Blood Request',
          body: `You have a new request for blood type ${bloodType}.`,
        },
        token: donorToken,
        android: {
          notification: {
            sound: 'default',
            channelId: 'high_importance_channel',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      // ✅ Send push notification
      await admin.messaging().send(message);
      console.log('✅ Notification sent to donor');
    } else {
      console.log('ℹ️ Donor has no FCM token, skipping notification');
    }

    // ✅ Return response
    res.status(201).json({ message: 'Order placed', order });

  } catch (error) {
    console.error('❌ Error placing order:', error);
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



exports.getOrdersByStatus = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }

  try {
    // Fetch both accepted and rejected orders for the user
    const [acceptedOrders, rejectedOrders] = await Promise.all([
      Order.find({
        $and: [
          {
            $or: [
              { requesterId: userId },
              { donorId: userId }
            ]
          },
          { status: 'accepted' }
        ]
      })
      .populate('requesterId', 'fullName email phone bloodType location')
      .populate('donorId', 'fullName email phone bloodType location')
      .sort({ createdAt: -1 }),

      Order.find({
        $and: [
          {
            $or: [
              { requesterId: userId },
              { donorId: userId }
            ]
          },
          { status: 'rejected' }
        ]
      })
      .populate('requesterId', 'fullName email phone bloodType location')
      .populate('donorId', 'fullName email phone bloodType location')
      .sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      message: 'Orders retrieved successfully',
      accepted: {
        total: acceptedOrders.length,
        orders: acceptedOrders
      },
      rejected: {
        total: rejectedOrders.length,
        orders: rejectedOrders
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
