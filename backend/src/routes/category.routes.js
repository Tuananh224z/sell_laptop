const router = require('express').Router();
const ctrl = require('../controllers/category.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { categoryUpload } = require('../middleware/upload');

// Public: lấy danh sách danh mục (dùng ở frontend store)
router.get('/', ctrl.getAll);

// Admin only
router.post('/',   verifyToken, requireAdmin, categoryUpload.single('image'), ctrl.create);
router.put('/:id', verifyToken, requireAdmin, categoryUpload.single('image'), ctrl.update);
router.delete('/:id', verifyToken, requireAdmin, ctrl.remove);
router.patch('/:id/visibility', verifyToken, requireAdmin, ctrl.toggleVisibility);

module.exports = router;
