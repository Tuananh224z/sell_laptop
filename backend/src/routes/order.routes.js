const express = require('express');
const router  = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken);

// User routes
router.post('/',    orderController.createOrder);
router.get('/',     orderController.getMyOrders);
router.get('/:id',  orderController.getOrderDetail);
router.patch('/:id/cancel', orderController.cancelOrder);

// Admin routes
router.get('/admin/all',          verifyToken, requireAdmin, orderController.getAllOrdersAdmin);
router.patch('/admin/:id/status', verifyToken, requireAdmin, orderController.updateOrderStatusAdmin);
router.post('/admin/pos',         verifyToken, requireAdmin, orderController.createPOSOrder);

module.exports = router;
