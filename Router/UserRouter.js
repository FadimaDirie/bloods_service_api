const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../middleware/upload'); // multer config
const UserRouter = express.Router();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';

// SIGNUP
UserRouter.post('/register', upload.single('profilePic'), async (req, res) => {
  const {
    fullName, email, age, phone, location,
    bloodType, username, password,
    isDonor, isRequester, fcmToken,
    city, latitude, longitude // ✅ added here
  } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: 'Username already exists' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ msg: 'Email already registered' });

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ msg: 'Valid password is required' });
    }

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ msg: 'Phone number is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePic = req.file ? req.file.filename : null;

    const newUser = new User({
      fullName,
      email,
      age,
      phone,
      location,
      bloodType,
      username,
      password: hashedPassword,
      profilePic,
      fcmToken,
      city,
      latitude: parseFloat(latitude),   // ✅ convert from string to number
      longitude: parseFloat(longitude), // ✅ convert from string to number
      roles: {
        isDonor: isDonor === 'true',
        isRequester: isRequester === 'true'
      }
    });

    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Update isDonor role only
UserRouter.put('/:id/updateRole', async (req, res) => {
  const { isDonor } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { 'roles.isDonor': isDonor },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ msg: 'Role updated successfully', user: updated });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});



// LOGIN
UserRouter.post('/login', async (req, res) => {
  const { username, password, fcmToken } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid username' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    // ✅ Save FCM token if provided
    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    // ✅ Create JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // ✅ Get full user object (including password)
    const userObj = user.toObject();

    // ✅ Update profilePic to full URL if it exists
    userObj.profilePic = userObj.profilePic
      ? `https://bloods-service-api.onrender.com/uploads/${userObj.profilePic}`
      : null;

    // ✅ Make sure fcmToken is included in the response
    userObj.fcmToken = user.fcmToken || null;

    // ✅ Send response
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


module.exports = UserRouter;
