const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donor = require('../models/donor');
const upload = require('../middleware/upload');
const UserRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';

// ✅ Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g. 1717000000.jpg
  }
});

const upload = multer({ storage });

router.post('/register', async (req, res) => {
  // ✅ Use multer inline
  upload.single('profilePic')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: 'Image upload error', error: err.message });
    }

    const {
      fullName,
      email,
      age,
      phone,
      bloodType,
      username,
      password,
      fcmToken,
      city,
      latitude,
      longitude,
      gender
    } = req.body;

    try {
      // Validate if user exists
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ msg: 'Username already exists' });

      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ msg: 'Email already registered' });

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ msg: 'Password is required' });
      }

      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ msg: 'Phone number is required' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Construct image path
      const profilePic = req.file ? `uploads/${req.file.filename}` : null;

      const newUser = new User({
        fullName,
        email,
        age,
        phone,
        bloodType,
        username,
        password: hashedPassword,
        profilePic,
        fcmToken,
        gender,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });

      await newUser.save();

      // ✅ Return full image URL
      const imageUrl = profilePic
        ? `${req.protocol}://${req.get('host')}/${profilePic}`
        : null;

      res.status(201).json({
        msg: 'User registered successfully',
        user: {
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: imageUrl,
          bloodType: newUser.bloodType,
          phone: newUser.phone,
          city: newUser.city,
          latitude: newUser.latitude,
          longitude: newUser.longitude,
          gender: newUser.gender
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  });
});
// ✅ Update Role (isDonor or isRequester)
UserRouter.put('/:id/updateRole', async (req, res) => {
  const { isDonor, isRequester } = req.body;

  try {
    const updateData = {};
    if (typeof isDonor === 'boolean') updateData['roles.isDonor'] = isDonor;
    if (typeof isRequester === 'boolean') updateData['roles.isRequester'] = isRequester;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'User not found' });
    }

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
          // lastDonationDate: new Date().toISOString(),
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

UserRouter.post('/login', async (req, res) => {
  const { phone, password, fcmToken } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ msg: 'Invalid phone number' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toObject();
    userObj.profilePic = userObj.profilePic
      ? `https://bloods-service-api.onrender.com/uploads/${userObj.profilePic}`
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

module.exports = UserRouter;
