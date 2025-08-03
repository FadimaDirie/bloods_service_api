const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';

exports.requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(401).json({ msg: 'Invalid or expired token' });
  }
};
