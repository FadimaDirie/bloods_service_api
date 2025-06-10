const express = require('express');
const router = express.Router();
const Donor = require('../models/donor');
const Request = require('../models/request');

// Get total donors
router.get('/total-donors', async (req, res) => {
    try {
        const totalDonors = await Donor.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                totalDonors
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching total donors',
            error: error.message
        });
    }
});

// Get total requests
router.get('/total-requests', async (req, res) => {
    try {
        const totalRequests = await Request.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                totalRequests
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching total requests',
            error: error.message
        });
    }
});

// Get pending requests
router.get('/pending-requests', async (req, res) => {
    try {
        const pendingRequests = await Request.countDocuments({ status: 'pending' });
        res.status(200).json({
            success: true,
            data: {
                pendingRequests
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending requests',
            error: error.message
        });
    }
});

// Get recent donations
router.get('/recent-donations', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentDonations = await Donor.countDocuments({
            lastDonationDate: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                recentDonations
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recent donations',
            error: error.message
        });
    }
});

// Get all statistics (combined endpoint)
router.get('/statistics', async (req, res) => {
    try {
        // Get total donors
        const totalDonors = await Donor.countDocuments();

        // Get total requests
        const totalRequests = await Request.countDocuments();

        // Get pending requests
        const pendingRequests = await Request.countDocuments({ status: 'pending' });

        // Get recent donations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentDonations = await Donor.countDocuments({
            lastDonationDate: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                totalDonors,
                totalRequests,
                pendingRequests,
                recentDonations
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

module.exports = router; 