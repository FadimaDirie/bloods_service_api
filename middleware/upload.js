const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // ensure folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname).toLowerCase();
    cb(null, uniqueName);
  },
});

// File filter (optional, to restrict image types)
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|gif/;
//   const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   cb(null, isValid);
// };

const upload = multer({ storage });

module.exports = upload;
