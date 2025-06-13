const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);
router.get('/myorders/:userId', orderController.getMyOrders);
const UserRouter = require('./Router/UserRouter'); // adjust path if needed

module.exports = router;
