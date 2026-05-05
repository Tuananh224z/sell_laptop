const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);

router.get('/',                    ctrl.getUsers);
router.post('/',                   ctrl.createUser);
router.get('/:id',                 ctrl.getUserById);
router.put('/:id',                 ctrl.updateUser);
router.delete('/:id',              ctrl.deleteUser);
router.patch('/:id/toggle',        ctrl.toggleUser);
router.patch('/:id/reset-password', ctrl.resetPassword);

module.exports = router;
