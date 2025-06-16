const multer = require('multer');
const path = require('path');

// Set up storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder must exist and be public
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1718557890.jpg
  },
});

const upload = multer({ storage });

// Upload route
app.post('/upload', upload.single('image'), (req, res) => {
  const imageUrl = `/uploads/${req.file.filename}`;
  // Save `imageUrl` to MongoDB
  res.json({ imageUrl });
});
