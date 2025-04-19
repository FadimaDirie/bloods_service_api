const express = require('express');
const UserRouter = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register
// const upload = require('../middleware/upload');

UserRouter.post('/register', upload.single('profilePic'), async (req, res) => {
  const {
    firstName, middleName, lastName, age,
    phone, location, bloodType, username, password
  } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePic = req.file ? req.file.filename : null;

    user = new User({
      firstName, middleName, lastName, age, phone,
      location, bloodType, username,
      password: hashedPassword,
      profilePic
    });

    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
// Login
UserRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid username' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    const { password: _, ...userWithoutPassword } = user.toObject();

    // Add full URL for profilePic
    if (userWithoutPassword.profilePic) {
      userWithoutPassword.profilePic = `http://localhost:4000/uploads/${userWithoutPassword.profilePic}`;
    }

    res.json({ msg: 'Login successful', user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = UserRouter;
