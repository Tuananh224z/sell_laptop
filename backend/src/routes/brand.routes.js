const router = require('express').Router();
const ctrl = require('../controllers/brand.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { brandUpload } = require('../middleware/upload');

// Public
router.get('/', ctrl.getAll);

// Admin only
router.post('/',   verifyToken, requireAdmin, brandUpload.single('logo'), ctrl.create);
router.put('/:id', verifyToken, requireAdmin, brandUpload.single('logo'), ctrl.update);
router.delete('/:id', verifyToken, requireAdmin, ctrl.remove);
router.patch('/:id/visibility', verifyToken, requireAdmin, ctrl.toggleVisibility);

module.exports = router;
