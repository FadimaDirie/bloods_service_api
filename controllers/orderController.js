const Order = require('../models/Order');
const admin = require('../firebase');
const User = require('../models/User');
const { sendSMS } = require('../models/smsService'); // ✅ Correct

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
    const messageText = `New request for ${bloodType} (${unit ?? 1} unit) for ${patientName ?? 'a patient'} at ${hospitalName ?? 'a hospital'}.`;

    if (donorUser?.fcmToken) {
      const message = {
        notification: {
          title: '🩸 Blood Request',
          
          // body: `You have a new request for ${bloodType} (${unit ?? 1} unit) for ${patientName ?? 'a patient'}.`,
          body: `Fadlan ka jawaab codsigan sida ugu dhaqsaha badan. Waxaa laga codsaday dhiig ${bloodType} (${unit ?? 1} unit) bukaanka ${patientName ?? 'aan la magacaabin'} oo yaala ${hospitalName ?? 'cusbitaal aan la cayimin'}.`,

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


     // ✅ Also send SMS to donor
    if (donorUser?.phone) {
      await sendSMS(messageText, [donorUser.phone]);
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
exports.updateOrderStatus = async (req, res) => {
  const { orderId, status, userId } = req.body;

  if (!orderId || !status || !userId) {
    return res.status(400).json({ message: 'Missing orderId, userId, or status' });
  }

  if (!['accepted', 'rejected', 'confirmed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('requesterId', 'fullName fcmToken phone')
     .populate('donorId', 'fullName bloodType');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const requester = updatedOrder.requesterId;
    const donor = updatedOrder.donorId;

    // ✅ If confirmed, update donor's lastDonationDate
    if (status === 'confirmed') {
      await User.findByIdAndUpdate(userId, {
        lastDonationDate: new Date()
      });
    }

    // ✅ Compose message
    const statusText = status === 'accepted'
      ? 'la aqbalay'
      : status === 'rejected'
      ? 'la diiday'
      : 'la xaqiijiyay';

    const smsText = `Codsigii dhiigga ee ${donor.bloodType} waxaa ${statusText} qofka ${donor.fullName}.`;

    // ✅ Send FCM
    if (requester?.fcmToken) {
      const notificationMessage = {
        notification: {
          title: `🩸 Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          body: `${donor.fullName} has ${status} your request for ${donor.bloodType} blood.`,
        },
        token: requester.fcmToken,
        android: {
          notification: { sound: 'default', channelId: 'high_importance_channel' },
        },
        apns: {
          payload: { aps: { sound: 'default' } },
        },
      };

      try {
        await admin.messaging().send(notificationMessage);
        console.log('✅ Notification sent to requester');
      } catch (fcmErr) {
        console.error('❌ FCM Error:', fcmErr.code, '-', fcmErr.message);
        if (fcmErr.code === 'messaging/registration-token-not-registered') {
          await User.findByIdAndUpdate(requester._id, { $unset: { fcmToken: 1 } });
          console.warn('⚠️ Invalid FCM token removed from requester record');
        }
      }
    } else {
      console.log('ℹ️ Requester has no valid FCM token');
    }

    // ✅ Send SMS
    if (requester?.phone) {
      await sendSMS(smsText, [requester.phone]);
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
      confirmed: ordersList.filter(o => o.status === 'confirmed'),
    });

    res.status(200).json({
      message: 'Orders requested from me retrieved successfully',
      ...classifyByStatus(receivedOrders)
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get all orders with donor and recipient info
exports.getAllOrdersWithUsers = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('requesterId', 'fullName email phone bloodType gender city')
      .populate('donorId', 'fullName email phone bloodType gender city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'All orders with donor and recipient info',
      total: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
