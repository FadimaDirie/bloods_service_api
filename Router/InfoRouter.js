const express = require('express');
const router = express.Router();

// GET /api/info/health-tips
router.get('/health-tips', (req, res) => {
  const tips = [
    { title: "Before Donation", content: "Eat iron-rich foods. Stay hydrated." },
    { title: "After Donation", content: "Rest. Drink fluids. Avoid heavy exercise." },
    { title: "Who Can't Donate", content: "People with certain diseases or low weight." }
  ];
  res.json(tips);
});

// ✅ ADD THIS BELOW
// GET /api/info/compatibility
router.get('/compatibility', (req, res) => {
    const matrix = {
      'A+': ['A+', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB+': ['AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'O-': ['Everyone'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'AB-': ['AB-', 'AB+']
    };
    res.json(matrix);
  });




module.exports = router;
