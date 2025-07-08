const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);
router.get('/myorders/:userId', orderController.getMyOrders);
router.put('/status', orderController.updateOrderStatus);



/// ✅ Corrected endpoints for dual roles
router.post('/requested-by-me', orderController.getMyRequestedOrders);
router.post('/requested-from-me', orderController.getOrdersRequestedFromMe);
router.get('/recent', orderController.getAllOrdersWithUsers);

module.exports = router;
