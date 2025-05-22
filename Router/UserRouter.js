const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../middleware/upload'); // multer config
const UserRouter = express.Router();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';

// SIGNUP
UserRouter.post('/register', upload.single('profilePic'), async (req, res) => {
  const {
    fullName,email,age, phone, location,
    bloodType, username, password, isDonor, isRequester
  } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: 'Username already exists' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ msg: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePic = req.file ? req.file.filename : null;

    const newUser = new User({
      fullName,email, age, phone,
      location, bloodType, username,
      password: hashedPassword,
      profilePic,
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

// LOGIN
UserRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid username' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    // Create JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...userData } = user.toObject();
    userData.profilePic = userData.profilePic
      ? `https://bloods-service-api.onrender.com/uploads/${userData.profilePic}`
      : null;

    res.json({
      msg: 'Login successful',
      token,
      user: userData
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = UserRouter;
