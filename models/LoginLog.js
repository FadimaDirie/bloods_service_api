const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  previousHash: { type: String },   // hash kii hore
  hash: { type: String }            // hash block-kan
});


module.exports = mongoose.model('LoginLog', loginLogSchema);