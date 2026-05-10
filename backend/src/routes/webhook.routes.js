const router = require('express').Router();
const ctrl = require('../controllers/webhook.controller');

router.post('/casso', ctrl.cassoWebhook);

module.exports = router;
