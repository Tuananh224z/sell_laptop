const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { verifyToken, requireAdmin, optionalVerifyToken } = require('../middleware/auth');
const { productMediaUpload } = require('../middleware/upload');

const media = productMediaUpload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 },
]);

// Public
router.get('/',    optionalVerifyToken, ctrl.getAll);
router.get('/admin/pos-search', verifyToken, requireAdmin, ctrl.getProductsPOS);
router.get('/:id', optionalVerifyToken, ctrl.getOne);
router.post('/:id/view', ctrl.incrementView);

// Admin CRUD
router.post('/',    verifyToken, requireAdmin, media, ctrl.create);
router.put('/:id',  verifyToken, requireAdmin, media, ctrl.update);
router.patch('/:id/visibility', verifyToken, requireAdmin, ctrl.toggleVisibility);
router.delete('/:id', verifyToken, requireAdmin, ctrl.remove);

// Product serials (no-variant)
router.post('/:id/serials',                verifyToken, requireAdmin, ctrl.addSerials);
router.patch('/:id/serials/:serialId',     verifyToken, requireAdmin, ctrl.updateSerial);
router.delete('/:id/serials/:serialId',    verifyToken, requireAdmin, ctrl.deleteSerial);

// Variant serials
router.post('/:id/variants/:variantId/serials',                    verifyToken, requireAdmin, ctrl.addVariantSerials);
router.patch('/:id/variants/:variantId/serials/:serialId',         verifyToken, requireAdmin, ctrl.updateVariantSerial);
router.delete('/:id/variants/:variantId/serials/:serialId',        verifyToken, requireAdmin, ctrl.deleteVariantSerial);

module.exports = router;
