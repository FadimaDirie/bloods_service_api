const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// POST /appointments – Schedule appointment
router.post('/', async (req, res) => {
  const { userId, date } = req.body;

  if (!userId || !date) {
    return res.status(400).json({ msg: 'User ID and appointment date are required' });
  }

  try {
    const newAppointment = new Appointment({
      userId,
      date: new Date(date)
    });

    await newAppointment.save();
    res.status(201).json({ msg: 'Appointment scheduled successfully', appointment: newAppointment });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to create appointment', error: err.message });
  }
});

// GET /appointments/all – Get all appointments
router.get('/all', async (req, res) => {
    try {
      const appointments = await Appointment.find().sort({ date: -1 });
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ msg: 'Failed to fetch all appointments', error: err.message });
    }
  });
  
  // GET /appointments/:userId – Get appointments by userId
  router.get('/:userId', async (req, res) => {
    try {
      const appointments = await Appointment.find({ userId: req.params.userId }).sort({ date: -1 });
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ msg: 'Failed to fetch appointments', error: err.message });
    }
  });
  

// PUT /appointments/:id/status – Update status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status value' });
  }

  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: 'Appointment not found' });

    res.json({ msg: 'Appointment status updated', appointment: updated });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update status', error: err.message });
  }
});

  

module.exports = router;
