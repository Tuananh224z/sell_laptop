const router = require('express').Router();
const ctrl = require('../controllers/support.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// User routes
router.post('/',           verifyToken, ctrl.createTicket);
router.get('/my',          verifyToken, ctrl.getMyTickets);
router.get('/:id',         verifyToken, ctrl.getTicketDetail);
router.post('/:id/reply',  verifyToken, ctrl.replyTicket);

// Admin routes
router.get('/admin/all',          verifyToken, requireAdmin, ctrl.getAllTicketsAdmin);
router.get('/admin/:id',          verifyToken, requireAdmin, ctrl.getTicketDetail);
router.patch('/admin/:id/status', verifyToken, requireAdmin, ctrl.updateStatusAdmin);

module.exports = router;
