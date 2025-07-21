const express = require('express');
const DonorRouter = express.Router();
const Donor = require('../models/donor')
const User = require('../models/User'); 
const City = require('../models/City'); // ama path sax ah haddii uu yahay './models/City'
  // your User model

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
      lastDonationDate: 1, // ✅ Include this line
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
  const { bloodType, city, startDate, endDate, search, sort = 'createdAt', order = 'desc' } = req.query;

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

  const sortOptions = { [sort]: order === 'asc' ? 1 : -1 };

  try {
    const donors = await User.find(query)
      .sort(sortOptions)
      .select('-password');

    res.json({
      total: donors.length,
      data: donors
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});
DonorRouter.get('/byBloodtype', async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { isDonor: true } }, // Only donors
      {
        $group: {
          _id: '$bloodType',
          totalDonors: { $sum: 1 }
        }
      },
      {
        $project: {
          bloodType: '$_id',
          totalDonors: 1,
          _id: 0
        }
      },
      { $sort: { bloodType: 1 } } // Optional: sort alphabetically by blood type
    ]);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

DonorRouter.get('/donersbyLocation', async (req, res) => {
  try {
    const donors = await User.find(
      { isDonor: true, latitude: { $ne: null }, longitude: { $ne: null } },
      { fullName: 1, latitude: 1, longitude: 1, bloodType: 1, _id: 0 }
    );

    res.json({
      success: true,
      data: donors
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// GET /api/donors/match?bloodType=A+&city=Mogadishu
DonorRouter.get('/match', async (req, res) => {
  const { bloodType, city } = req.query;
  try {
    const donors = await User.find({
      isDonor: true,
      bloodType,
      city,
      availability: 'Available',
      healthStatus: 'Healthy'
    }).sort({ lastDonationDate: 1 }); // least recent first

    res.json(donors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


DonorRouter.get('/coverage-by-city', async (req, res) => {
  try {
    const result = await City.aggregate([
      {
        $lookup: {
          from: "users",
          let: { cityName: "$name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$isDonor", true] },
                    { $eq: ["$isSuspended", false] },
                    { $eq: ["$availability", "Available"] },
                    {
                      $or: [
                        { $eq: ["$city", "$$cityName"] }, // city as string
                        {
                          $and: [
                            { $isArray: "$city" },
                            { $in: ["$$cityName", "$city"] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: "donors"
        }
      },
      {
        $project: {
          _id: 1,
          city: "$name",
          count: { $size: "$donors" },
          latitude: { $first: "$donors.latitude" },
          longitude: { $first: "$donors.longitude" }
        }
      }
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



DonorRouter.get('/city-debug', async (req, res) => {
  try {
    const donors = await User.find(
      { isDonor: true, isSuspended: false, availability: 'Available' },
      { city: 1, latitude: 1, longitude: 1, _id: 0 }
    ).lean();

    res.json({ count: donors.length, donors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});







// GET /api/donors/stats-by-city
DonorRouter.get('/stats-by-city-and-blood', async (req, res) => {
  const { search, city, bloodType } = req.query;

  const match = { isDonor: true };

  if (city) {
    match.city = city;
  }

  if (bloodType) {
    match.bloodType = bloodType;
  }

  if (search) {
    match.fullName = { $regex: search, $options: 'i' };
  }

  const bloodTypes = ['A+', 'O+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

  try {
    const result = await User.aggregate([
      { $match: match },
      {
        $group: {
          _id: { city: '$city', bloodType: '$bloodType' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.city',
          bloodGroups: {
            $push: {
              bloodType: '$_id.bloodType',
              count: '$count'
            }
          }
        }
      },
      {
        $addFields: {
          bloodGroups: {
            $map: {
              input: bloodTypes,
              as: 'type',
              in: {
                $let: {
                  vars: {
                    match: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$bloodGroups',
                            as: 'g',
                            cond: { $eq: ['$$g.bloodType', '$$type'] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    bloodType: '$$type',
                    count: { $ifNull: ['$$match.count', 0] }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          city: '$_id',
          bloodGroups: 1
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
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
