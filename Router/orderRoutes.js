const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);
router.get('/myorders/:userId', orderController.getMyOrders);
router.put('/status', orderController.updateOrderStatus);

// Use POST to allow request body
router.post('/order_by_status', orderController.getOrdersByStatus);


// New endpoints for dual roles
router.post('/requested_by_me', orderController.getMyRequestedOrders);
router.post('/requested_from_me', orderController.getOrdersRequestedFromMe);

module.exports = router;
