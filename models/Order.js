const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    required: true
  },
<<<<<<< HEAD
=======
  status: {
    type: String,
    default: 'waiting' // Default value is now 'waiting'
  },
>>>>>>> f8878d5 (update)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
