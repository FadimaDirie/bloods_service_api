const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const UserRouter = require('./routes/UserRouter'); // adjust path if needed

router.post('/orders', orderController.createOrder);
router.get('/myorders/:userId', orderController.getMyOrders);
router.put('/orders/:orderId/status', orderController.updateOrderStatus);

module.exports = router;
