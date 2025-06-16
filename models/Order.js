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
  unit: {
    type: Number,
    default: 1
  },
  hospitalName: {
    type: String,
    default: ''
  },
  patientName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'waiting'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
