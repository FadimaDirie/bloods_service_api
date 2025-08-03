const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donor = require('../models/donor');
const upload = require('../middleware/upload');
const userController = require('../controllers/userController');

const UserRouter = express.Router();
const { logToBlockchain } = require('../utils/blockchainLogger'); // ⬅️ Add this at the top

const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';
// POST /api/users/update_fcm
UserRouter.post('/update_fcm', userController.updateFCMToken);

UserRouter.post('/register', upload.single('profilePic'), async (req, res) => {
  const {
    fullName, email, age, phone,
    bloodType, username, password,
    fcmToken, city, district, region,
    latitude, longitude, gender, weight,
    lastDonationDate, availability, healthStatus,
    healthChecklist, isAdmin
  } = req.body;

  try {
    // 🚫 Duplicate phone check
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ msg: 'User already registered with this phone number' });
    }

    // 🛡️ Basic validation
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ msg: 'Valid password is required' });
    }

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ msg: 'Phone number is required' });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🖼️ Handle profile picture
    const profilePic = req.file ? req.file.filename.replace(/[,]/g, '') : null;

    // ✅ Final user creation
    const newUser = new User({
      fullName,
      email: email || undefined,
      age: age ? parseInt(age) : undefined,
      phone,
      bloodType,
      username: username || undefined,
      password: hashedPassword,
      profilePic,
      fcmToken,
      gender,
      city: typeof city === 'string' ? city : undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined,
      availability: availability || 'Available',
      healthStatus: healthStatus || 'Healthy',
      healthChecklist: healthChecklist === 'true' || healthChecklist === true,
      isAdmin: isAdmin === 'true' || isAdmin === true,
      isSuspended: false
    });

    await newUser.save();

    res.status(201).json({
      msg: 'User registered successfully',
      user: {
        ...newUser.toObject(),
        profilePicUrl: profilePic ? `${req.protocol}://${req.get('host')}/upload/${profilePic}` : null
      }
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});



UserRouter.get('/all', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // users oo ugu dambeeyey ugu horeeya
    res.json({ users });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});



// ✅ Update Role (isDonor or isRequester)
UserRouter.put('/:id/updateRole', async (req, res) => {
  const { isDonor, isRequester } = req.body;

  try {
    const updateData = {};
    if (typeof isDonor === 'boolean') updateData.isDonor = isDonor;
    if (typeof isRequester === 'boolean') updateData.isRequester = isRequester;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // ✅ Haddii uu noqdo donor, check if exists in Donor collection
    if (isDonor === true) {
      const existingDonor = await Donor.findOne({ phone: updated.phone });
      if (!existingDonor) {
        const newDonor = new Donor({
          fullName: updated.fullName,
          phone: updated.phone,
          location: updated.city,
          bloodGroup: updated.bloodType,
          age: updated.age,
          healthStatus: 'Healthy',
          availability: 'Available',
          weight: 0,
          type: updated.bloodType
        });
        await newDonor.save();
      }
    }

    res.json({ msg: 'Roles updated successfully', user: updated });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ✅ LOGIN ROUTE
UserRouter.post('/login', async (req, res) => {
  const { phone, password, fcmToken } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ msg: 'Invalid phone number' });

    // ✅ Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        msg: 'Your account has been suspended. Please contact support for assistance.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    // ✅ Update FCM token if provided
    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    await logToBlockchain(user._id); // log login

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toObject();
    userObj.profilePic = user.profilePic
      ? `${req.protocol}://${req.get('host')}/${user.profilePic}`
      : null;
    userObj.fcmToken = user.fcmToken || null;

    res.json({
      msg: 'Login successful',
      token,
      user: userObj
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});



// ✅ Save FCM Token
UserRouter.post('/save-token', async (req, res) => {
  const { userId, fcmToken } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.status(200).json({ msg: 'Token saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ GET donors by blood group using user model only
UserRouter.get('/donors/group/:bloodGroup', async (req, res) => {
  try {
    const donors = await User.find({
      'roles.isDonor': true,
      bloodType: req.params.bloodGroup
    }, {
      fullName: 1,
      city: 1,
      bloodType: 1,
      fcmToken: 1,
      age: 1,
      phone: 1
    });

    res.status(200).json(donors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

const admin = require('../firebase'); // Make sure this is imported

UserRouter.get('/:id/eligibility', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.isDonor) {
      return res.status(404).json({ eligible: false, reason: 'Not a donor' });
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    const eligible = (!user.lastDonationDate || user.lastDonationDate < sixMonthsAgo) &&
                     user.age >= 18 && user.weight >= 50 && user.healthStatus === 'Healthy';

    // 🔔 Send FCM notification if eligible
    if (eligible && user.fcmToken) {
      await admin.messaging().send({
        token: user.fcmToken,
        notification: {
          title: "You're eligible to donate again!",
          body: "Six months have passed since your last donation. Ready to save a life?"
        }
      });
    }

    res.json({ eligible, reason: eligible ? null : 'Donor not eligible due to age, weight, health, or recent donation' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


// PUT /api/users/:id/availability
UserRouter.put('/:id/availability', async (req, res) => {
  const { status } = req.body; // Available / Busy
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { availability: status }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Error updating availability', error: err.message });
  }
});



UserRouter.post('/updatelocation', async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  try {
    if (!userId || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId, latitude, or longitude',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { latitude, longitude },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('updateLocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});



const { requireAdmin } = require('../middleware/auth');
// ✅ UPDATE USER PROFILE
UserRouter.put('/:id/update', requireAdmin, upload.single('profilePic'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      age,
      phone,
      bloodType,
      city,
      district,
      region,
      latitude,
      longitude,
      gender,
      weight,
      availability,
      healthStatus,
      lastDonationDate
    } = req.body;

    const updates = {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(bloodType && { bloodType }),
      ...(city && { city }),
      ...(district && { district }),
      ...(region && { region }),
      ...(gender && { gender }),
      ...(availability && { availability }),
      ...(healthStatus && { healthStatus }),
      ...(age ? { age: parseInt(age) } : {}),
      ...(weight ? { weight: parseFloat(weight) } : {}),
      ...(latitude ? { latitude: parseFloat(latitude) } : {}),
      ...(longitude ? { longitude: parseFloat(longitude) } : {}),
      ...(lastDonationDate ? { lastDonationDate: new Date(lastDonationDate) } : {})
    };

    // ✅ Handle optional profile picture update
    if (req.file) {
      updates.profilePic = req.file.filename.replace(/[,]/g, '');
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      msg: 'User updated successfully',
      user: {
        ...updatedUser.toObject(),
        profilePicUrl: updatedUser.profilePic
          ? `${req.protocol}://${req.get('host')}/upload/${updatedUser.profilePic}`
          : null
      }
    });

  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});




module.exports = UserRouter;
