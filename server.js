const express = require('express');
const connectDB = require('./config/db');
const UserRouter = require('./Router/UserRouter');
const DonorRouter = require('./Router/DonorRouter.js')
const orderRoutes = require('./routes/orderRoutes');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); 
const RequestBloodRouter = require('./Router/RequestBloodRouter.js');
const ReportRouter = require('./Router/ReportRouter.js');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

// Connect to database
(async () => {
    try {
        await connectDB();
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
    }
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route to check if server is running
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Blood Service API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ 
        status: 'ok', 
        message: 'Server is running',
        database: dbStatus
    });
});

// ✅ Check and create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Static files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/notify', require('./Router/notification'));
app.use('/api/user', UserRouter);
app.use('/api/donor', DonorRouter);
app.use('/api/requestblood', RequestBloodRouter);
app.use('/api/reports', ReportRouter);
app.use('/api', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler - must be after all other routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't crash the server, just log the error
});

module.exports = app;
