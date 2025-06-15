const express = require('express');
const DonorRouter = express.Router();
const Donor = require('../models/donor')
const User = require('../models/User');   // your User model

// POST /api/donors
DonorRouter.post('/donors', async (req, res) => {
  try { 
    const newDonor = new Donor(req.body);
    const saved = await newDonor.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/donor/donors/group/:bloodType
DonorRouter.get('/donors/group/:bloodType', async (req, res) => {
  try {
    const donors = await User.find({
      isDonor: true,
      bloodType: req.params.bloodType
    }).select({
      fullName: 1,
      email: 1,
      age: 1,
      phone: 1,
      gender: 1,
      city: 1,
      latitude: 1,
      longitude: 1,
      bloodType: 1,
      username: 1,
      profilePic: 1,
      fcmToken: 1,
      isDonor: 1,
      isRequester: 1,
      createdAt: 1,
      updatedAt: 1
    });

    res.status(200).json(donors);
  } catch (err) {
    console.error('Error fetching donors:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/donors/all?bloodType=A+&city=Hodan&startDate=2025-06-01&endDate=2025-06-15
// GET /api/donors/all?search=abdi&sort=createdAt&order=desc&page=1&limit=10
DonorRouter.get('/all', async (req, res) => {
  const { bloodType, city, startDate, endDate, search, sort = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

  const query = { isDonor: true };
  if (bloodType) query.bloodType = bloodType;
  if (city) query.city = city;
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  if (search) {
    query.fullName = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sort]: order === 'asc' ? 1 : -1 };

  try {
    const total = await User.countDocuments(query);
    const donors = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: donors
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


// GET /api/donors/stats-by-city
DonorRouter.get('/stats-by-city', async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { isDonor: true } },
      {
        $group: {
          _id: '$city',
          totalDonors: { $sum: 1 },
          lat: { $first: '$latitude' },
          lng: { $first: '$longitude' },
        }
      },
      {
        $project: {
          city: '$_id',
          totalDonors: 1,
          lat: 1,
          lng: 1,
          _id: 0
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: 'Error', err });
  }
});
const excelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// GET /api/donors/export?format=excel or pdf
DonorRouter.get('/export', async (req, res) => {
  const { format } = req.query;

  try {
    const donors = await User.find({ isDonor: true }).select('-password');

    if (format === 'excel') {
      const workbook = new excelJS.Workbook();
      const sheet = workbook.addWorksheet('Donors');

      sheet.columns = [
        { header: 'Full Name', key: 'fullName' },
        { header: 'Phone', key: 'phone' },
        { header: 'City', key: 'city' },
        { header: 'Blood Type', key: 'bloodType' },
        { header: 'Latitude', key: 'latitude' },
        { header: 'Longitude', key: 'longitude' },
        { header: 'Created', key: 'createdAt' }
      ];

      donors.forEach(d => sheet.addRow(d));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=donors.xlsx');
      await workbook.xlsx.write(res);
      res.end();

    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      doc.pipe(res);
      doc.fontSize(16).text('Donor Report', { align: 'center' });
      donors.forEach(d => {
        doc.fontSize(12).text(`Name: ${d.fullName}, Phone: ${d.phone}, BloodType: ${d.bloodType}, City: ${d.city}`);
      });
      doc.end();
    } else {
      res.status(400).json({ msg: 'Invalid format' });
    }

  } catch (err) {
    res.status(500).json({ msg: 'Error generating export', err });
  }
});


module.exports = DonorRouter;
