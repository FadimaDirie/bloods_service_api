const express = require('express');
const router = express.Router();
const Donor = require('../models/donor');
const Request = require('../models/request');

// Simple test route
router.get('/test', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Report router is working'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get total donors count
router.get('/donors-count', async (req, res) => {
    try {
        const count = await Donor.countDocuments();
        res.json({
            success: true,
            data: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get total requests count
router.get('/requests-count', async (req, res) => {
    try {
        const count = await Request.countDocuments();
        res.json({
            success: true,
            data: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get pending requests count
router.get('/pending-count', async (req, res) => {
    try {
        const count = await Request.countDocuments({ status: 'pending' });
        res.json({
            success: true,
            data: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get recent donations (last 30 days)
router.get('/recent-donations', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const count = await Donor.countDocuments({
            lastDonationDate: { $gte: thirtyDaysAgo }
        });
        
        res.json({
            success: true,
            data: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 