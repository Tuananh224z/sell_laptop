const router = require('express').Router();
const ctrl   = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/',              ctrl.getCart);
router.post('/add',          ctrl.addToCart);
router.patch('/:itemId',     ctrl.updateItem);
router.delete('/:itemId',    ctrl.removeItem);
router.delete('/',           ctrl.clearCart);

module.exports = router;
