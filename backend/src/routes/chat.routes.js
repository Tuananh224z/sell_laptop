const router = require('express').Router();
const ctrl = require('../controllers/chat.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken);

// User/Common routes
router.get('/my',        ctrl.getConversationUser);
router.get('/:id',       ctrl.getConversationDetail);
router.post('/:id/send', ctrl.sendMessage);

// Admin routes
router.get('/admin/all', requireAdmin, ctrl.getConversationsAdmin);

module.exports = router;
