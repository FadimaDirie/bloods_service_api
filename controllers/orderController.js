const Order = require('../models/Order');
const admin = require('../firebase');
const User = require('../models/User');
const { sendSMS } = require('../models/smsService'); // ✅ Correct

// ✅ Create a new blood order (includes patient situation in FCM + SMS)
exports.createOrder = async (req, res) => {
  try {
    const {
      requesterId,
      donorId,
      bloodType,
      unit,
      hospitalName,
      patientName,
      description
    } = req.body;

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
      patientName,
      description
    });
    await order.save();

    // Look up donor
    const donorUser = await User.findById(donorId);

    // --- Build safe text values ---
    const normalize = (v) => (v ?? '').toString().trim();
    const _bloodType   = normalize(bloodType);
    const _unit        = unit ?? 1;
    const _patient     = normalize(patientName) || 'aan la magacaabin';
    const _hospital    = normalize(hospitalName) || 'cusbitaal aan la cayimin';

    // Patient situation (Somali). Shorten for SMS; keep readable.
    const situationRaw = normalize(description);
    const situationSnippet = situationRaw
      ? situationRaw.replace(/\s+/g, ' ').slice(0, 180)
      : 'Emergency';

    // ✅ SMS text (Somali) — includes patient situation
    const messageText =
      `Codsi dhiig ${_bloodType} (${_unit} unit) ` +
      `bukaanka ${_patient} ee ${_hospital}. ` +
      `Xaaladda bukaanka: ${situationSnippet}`;

    // ✅ Push Notification (Somali) — includes patient situation
    if (donorUser?.fcmToken) {
      const message = {
        notification: {
          title: '🩸 Blood Request',
          body:
            `Fadlan ka jawaab codsigan sida ugu dhaqsaha badan. ` +
            `Waxaa laga codsaday dhiig ${_bloodType} (${_unit} unit) ` +
            `bukaanka ${_patient} oo yaalla ${_hospital}. ` +
            `Xaaladda bukaanka: ${situationSnippet}`,
        },
        // Include useful data for deep-links / in-app routing
        data: {
          orderId: order._id.toString(),
          type: 'blood_request',
          bloodType: _bloodType,
          unit: String(_unit),
          patientName: _patient,
          hospitalName: _hospital,
          patientSituation: situationSnippet,
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

    // ✅ Also send SMS to donor (includes patient situation)
    if (donorUser?.phone) {
      try {
        await sendSMS(messageText, [donorUser.phone]);
      } catch (smsErr) {
        console.warn('⚠️ SMS send failed:', smsErr.message);
      }
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
      approved: ordersList.filter(o => o.status === 'approved'),  // ✅ added
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
      approved: ordersList.filter(o => o.status === 'approved'),
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



// ✅ Return all orders that I (userId) requested from others
exports.getAllStatusesForOrdersRequestedFromMe = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }

  try {
    const allOrders = await Order.find({ requesterId: userId }) // ✅ updated here
      .populate('requesterId', 'fullName email phone bloodType location')
      .populate('donorId', 'fullName email phone bloodType location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'All orders I requested retrieved successfully',
      total: allOrders.length,
      orders: allOrders
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




// ✅ Return all "accepted" orders that I (userId) requested from others
exports.getAcceptedOrdersRequestedFromMe = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }

  try {
    const acceptedOrders = await Order.find({
      requesterId: userId,
      status: 'confirmed'
    })
      .populate('requesterId', 'fullName email phone bloodType location')
      .populate('donorId', 'fullName email phone bloodType location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'confirmed orders retrieved successfully',
      total: acceptedOrders.length,
      orders: acceptedOrders
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getTodayTransfusionsAllConfirmed = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end   = dayjs().endOf("day").toDate();

    const orders = await Order.find({
      status: "confirmed",
      createdAt: { $gte: start, $lte: end },
    })
      .populate("requesterId", "fullName email phone bloodType location")
      .populate("donorId", "fullName email phone bloodType location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "confirmed orders retrieved successfully",
      total: orders.length,
      orders,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.approveOrderAndRewardDonor = async (req, res) => {
  const { orderId, userId, rewardPoints = 50 } = req.body;

  if (!orderId || !userId) {
    return res.status(400).json({ message: 'Missing orderId or userId' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'approved' },
      { new: true }
    )
      .populate('requesterId', 'fullName fcmToken phone')
      .populate('donorId', 'fullName fcmToken phone bloodType');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const requester = order.requesterId;
    const donor     = order.donorId;

    // 2) Reward donor (+points) & set lastDonationDate
    if (donor?._id) {
      await User.findByIdAndUpdate(
        donor._id,
        {
          $inc: { rewardPoints: rewardPoints },         // creates if missing
          $set: { lastDonationDate: new Date() }
        },
        { new: true }
      );
    }

    // 3) Compose donor “thank you” messages
    const thankTitle = 'Thank you for donating! ';
    const thankBody  = `You earned +${rewardPoints} points for donating ${order.unit || 1} unit(s) of ${order.bloodType} to ${requester?.fullName || 'a patient'}.`;

    // 4) FCM to donor (reward/thanks)
    if (donor?.fcmToken) {
      const donorMsg = {
        notification: { title: thankTitle, body: thankBody },
        token: donor.fcmToken,
        android: { notification: { sound: 'default', channelId: 'high_importance_channel' } },
        apns: { payload: { aps: { sound: 'default' } } },
      };

      try {
        await admin.messaging().send(donorMsg);
        console.log(' Reward/Thanks notification sent to donor');
      } catch (fcmErr) {
        console.error(' FCM Error (donor):', fcmErr.code, '-', fcmErr.message);
        if (fcmErr.code === 'messaging/registration-token-not-registered') {
          await User.findByIdAndUpdate(donor._id, { $unset: { fcmToken: 1 } });
          console.warn('Invalid FCM token removed from donor record');
        }
      }
    } else {
      console.log('ℹ Donor has no valid FCM token');
    }

    // 5) Optional SMS to donor (reward/thanks)
    if (donor?.phone) {
      const smsText = `JazaakAllahu Khayran! Waxaad heshay Ajr weyn inshaAllah Qofkii badbaadiya hal naf, waxay la mid tahay sidii uu badbaadiyay dhammaan dadka" (Suuradda: Al-Maa’idah 5:32)". Nooc: ${order.bloodType}, Qadarka: ${order.unit || 1}.`;
      try {
        await sendSMS(smsText, [donor.phone]);
      } catch (e) {
        console.warn('SMS send failed (donor):', e.message);
      }
    }

    // (Optional) notify requester that order got approved
    if (requester?.fcmToken) {
      const requesterMsg = {
        notification: {
          title: 'Request Approved ',
          body: `${donor?.fullName || 'Donor'} approved your request for ${order.bloodType} blood.`,
        },
        token: requester.fcmToken,
        android: { notification: { sound: 'default', channelId: 'high_importance_channel' } },
        apns: { payload: { aps: { sound: 'default' } } },
      };

      try {
        await admin.messaging().send(requesterMsg);
        console.log(' Approval notification sent to requester');
      } catch (fcmErr) {
        console.error(' FCM Error (requester):', fcmErr.code, '-', fcmErr.message);
        if (fcmErr.code === 'messaging/registration-token-not-registered') {
          await User.findByIdAndUpdate(requester._id, { $unset: { fcmToken: 1 } });
          console.warn(' Invalid FCM token removed from requester record');
        }
      }
    }

    // 6) Done
    return res.status(200).json({
      message: 'Order approved, donor rewarded and thanked.',
      rewardPoints,
      order
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
