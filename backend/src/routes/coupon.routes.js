const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public/User routes
router.post('/validate', verifyToken, couponController.validateCoupon);

// Admin routes
router.get('/',          verifyToken, requireAdmin, couponController.getAllCoupons);
router.post('/',         verifyToken, requireAdmin, couponController.createCoupon);
router.patch('/:id',     verifyToken, requireAdmin, couponController.updateCoupon);
router.delete('/:id',    verifyToken, requireAdmin, couponController.deleteCoupon);

module.exports = router;
