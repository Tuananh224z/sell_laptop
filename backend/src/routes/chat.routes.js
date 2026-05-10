const router = require('express').Router();
const ctrl = require('../controllers/chat.controller');
const { verifyToken, requireAdmin, optionalVerifyToken } = require('../middleware/auth');

// User/Common routes
router.get('/my',        verifyToken, ctrl.getConversationUser);
router.get('/:id',       verifyToken, ctrl.getConversationDetail);
router.post('/ai',       optionalVerifyToken, ctrl.chatWithAI);
router.post('/:id/send', verifyToken, ctrl.sendMessage);

// Admin routes
router.get('/admin/all', verifyToken, requireAdmin, ctrl.getConversationsAdmin);

module.exports = router;
