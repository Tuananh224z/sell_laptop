const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.use(isAdmin);

router.get('/history', inventoryController.getHistory);
router.post('/import', inventoryController.importStock);

module.exports = router;
