const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');

// ✅ Routers
const UserRouter = require('./Router/UserRouter'); // 🔄 Corrected path
const DonorRouter = require('./Router/DonorRouter');
const OrderRoutes = require('./Router/orderRoutes');
const RequestBloodRouter = require('./Router/RequestBloodRouter');
const ReportRouter = require('./Router/ReportRouter');
const NotificationRouter = require('./Router/notification');
const AppointmentRouter = require('./Router/AppointmentRouter');
const InfoRouter = require('./Router/InfoRouter');

const app = express();

// ✅ Connect to DB
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
})();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/upload', express.static('uploads'));

// ✅ Health Check
app.get('/', (_, res) => res.json({ message: 'Welcome to Blood Service API' }));
app.get('/health', (_, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ status: 'ok', message: 'Server is running', database: dbStatus });
});

const cityRouter = require('./Router/CityRouter');
app.use('/api/cities', cityRouter);

const healthRouter = require('./Router/HealthRouter ');

app.use('./api/health', healthRouter);

const adminRouter = require('./Router/AdminRouter');
app.use('/api/admin', adminRouter);

// ✅ Mount Routers
app.use('/api/user', UserRouter); // 🟢 Includes POST /update_fcm
app.use('/api/donor', DonorRouter);
app.use('/api/orders', OrderRoutes); // example: /api/orders/create
app.use('/api/updateOrderStatus', OrderRoutes);
app.use('/api/requestblood', RequestBloodRouter);
app.use('/api/reports', ReportRouter);
app.use('/api/notify', NotificationRouter);
app.use('/api/appointments', AppointmentRouter);
app.use('/api/info', InfoRouter);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ✅ 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Handle Errors Gracefully
process.on('unhandledRejection', err => console.error('Unhandled Rejection:', err));
process.on('uncaughtException', err => console.error('Uncaught Exception:', err));
