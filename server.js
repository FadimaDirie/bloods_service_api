const express = require('express');
const connectDB = require('./config/db');
const UserRouter = require('./Router/UserRouter');
const DonorRouter = require('./Router/DonorRouter.js')
const cors = require('cors');
const path = require('path');
const fs = require('fs'); 
const RequestBloodRouter = require('./Router/RequestBloodRouter.js');


require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ✅ Check and create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Now serve the uploads folder
app.use('/uploads', express.static(uploadsDir));

const notifyRoute = require('./Router/notification');
app.use('/api/notify', notifyRoute);





app.use('/api/user', UserRouter);
app.use('/api/donor', DonorRouter);
app.use('/api/requestblood', RequestBloodRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
