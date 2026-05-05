const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// User routes
router.get('/my', verifyToken, ctrl.getMyNotifications);

// Admin routes
router.get('/admin/all',   verifyToken, requireAdmin, ctrl.getAllNotificationsAdmin);
router.post('/admin',      verifyToken, requireAdmin, ctrl.createNotification);
router.put('/admin/:id',   verifyToken, requireAdmin, ctrl.updateNotification);
router.delete('/admin/:id', verifyToken, requireAdmin, ctrl.deleteNotification);

module.exports = router;
