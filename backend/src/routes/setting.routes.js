const router = require('express').Router();
const ctrl = require('../controllers/setting.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { settingsUpload } = require('../middleware/upload');

const uploadFields = settingsUpload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner1', maxCount: 1 },
  { name: 'banner2', maxCount: 1 },
  { name: 'banner3', maxCount: 1 },
]);

router.get('/', ctrl.getSettings);
router.put('/admin', verifyToken, requireAdmin, uploadFields, ctrl.updateSettingsAdmin);

module.exports = router;
