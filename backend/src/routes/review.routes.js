const router = require('express').Router();
const ctrl = require('../controllers/review.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/:productId', ctrl.getProductReviews);
router.get('/:productId/check', verifyToken, ctrl.checkCanReview);
router.post('/:productId', verifyToken, ctrl.createReview);

// Admin
router.get('/admin/all', verifyToken, requireAdmin, ctrl.getAllReviewsAdmin);
router.patch('/admin/:id/status', verifyToken, requireAdmin, ctrl.updateReviewStatus);
router.post('/admin/:id/reply', verifyToken, requireAdmin, ctrl.replyToReview);
router.delete('/admin/:id', verifyToken, requireAdmin, ctrl.deleteReview);

module.exports = router;
