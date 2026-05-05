const router = require('express').Router();
const ctrl = require('../controllers/membership.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/tiers', ctrl.getTiers);
router.get('/admin/stats', verifyToken, requireAdmin, ctrl.getMembershipStats);
router.get('/admin/tiers', verifyToken, requireAdmin, ctrl.getTiers);
router.post('/admin/tiers', verifyToken, requireAdmin, ctrl.updateTierSettings);
router.post('/admin/user/:userId/points', verifyToken, requireAdmin, ctrl.updateUserPoints);
router.post('/admin/sync', verifyToken, requireAdmin, ctrl.syncTiers);
router.get('/admin/settings', verifyToken, requireAdmin, ctrl.getLoyaltySettings);
router.post('/admin/settings', verifyToken, requireAdmin, ctrl.updateLoyaltySettings);
router.post('/admin/check-demotion', verifyToken, requireAdmin, ctrl.checkAndDemoteUsers);

module.exports = router;
