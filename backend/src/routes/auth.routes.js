const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');

// Public
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

// Authenticated
router.get('/me', verifyToken, ctrl.getMe);
router.post('/verify-email', verifyToken, ctrl.verifyEmail);
router.post('/resend-otp', verifyToken, ctrl.resendOtp);
router.post('/change-password', verifyToken, ctrl.changePassword);
router.put('/profile', verifyToken, ctrl.updateProfile);
router.post('/avatar', verifyToken, avatarUpload.single('avatar'), ctrl.uploadAvatar);

router.get('/wishlist', verifyToken, ctrl.getWishlist);
router.post('/wishlist/:productId', verifyToken, ctrl.toggleWishlist);

module.exports = router;
