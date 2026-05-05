const router = require('express').Router();
const ctrl = require('../controllers/address.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken); // Tất cả routes cần auth

router.get('/',              ctrl.getAddresses);
router.post('/',             ctrl.createAddress);
router.put('/:id',           ctrl.updateAddress);
router.delete('/:id',        ctrl.deleteAddress);
router.patch('/:id/default', ctrl.setDefault);

module.exports = router;
