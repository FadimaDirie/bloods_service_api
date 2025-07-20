// Router/AdminRouter.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Get all users
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// ✅ Toggle suspend
router.patch('/suspend/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  user.isSuspended = !user.isSuspended;
  await user.save();
  res.json({ msg: `User ${user.isSuspended ? 'suspended' : 'activated'}`, user });
});

// ✅ Unsuspend user explicitly
router.patch('/unsuspend/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    if (!user.isSuspended) {
      return res.status(200).json({ success: true, msg: 'User is already active', user });
    }

    user.isSuspended = false;
    await user.save();

    res.json({ success: true, msg: 'User successfully reactivated', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: 'Server error', error });
  }
});


// ✅ Promote/demote admin
router.patch('/admin/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  user.isAdmin = !user.isAdmin;
  await user.save();
  res.json({ msg: `User ${user.isAdmin ? 'promoted to admin' : 'demoted from admin'}`, user });
});

module.exports = router;
