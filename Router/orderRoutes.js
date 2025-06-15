const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);
router.get('/myorders/:userId', orderController.getMyOrders);
router.put('/status', orderController.updateOrderStatus);

// Use POST to allow request body
router.post('/orders/accepted', orderController.getAcceptedOrders);
router.post('/orders/rejected', orderController.getRejectedOrders);

module.exports = router;
