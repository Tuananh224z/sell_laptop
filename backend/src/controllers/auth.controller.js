const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const emailService = require('../services/email.service');

/* ─── Helpers ─── */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const makeToken = () => crypto.randomBytes(32).toString('hex');

const userPublic = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  initials: u.initials,
  isActive: u.isActive,
  isVerified: u.isVerified,
  gender: u.gender,
  dob: u.dob,
  avatar: u.avatar,
  wishlist: u.wishlist,
  createdAt: u.createdAt,
});

/* ────────────────────────────────────────
   POST /api/auth/register
──────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email đã được sử dụng' });

    const otp = makeOtp();
    const expiry = new Date(Date.now() + Number(process.env.EMAIL_VERIFY_EXPIRES_MIN || 10) * 60_000);

    const user = await User.create({
      name, email, phone, password,
      verifyToken: otp,
      verifyTokenExpiry: expiry,
      isVerified: false,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshCookie(res, refreshToken);

    // Gửi email OTP xác thực (non-blocking)
    emailService.sendVerifyEmail(email, name, otp).catch((err) =>
      console.error('[EMAIL] Lỗi gửi email xác thực:', err.message)
    );

    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
      accessToken,
      user: userPublic(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/login
──────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshCookie(res, refreshToken);

    res.json({ message: 'Đăng nhập thành công', accessToken, user: userPublic(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/verify-email
   Body: { otp }
──────────────────────────────────────── */
exports.verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await req.user?.id
      ? await User.findById(req.user.id).select('+verifyToken +verifyTokenExpiry')
      : null;

    if (!user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (user.isVerified) return res.status(400).json({ message: 'Email đã được xác thực' });
    if (!user.verifyToken || user.verifyToken !== otp)
      return res.status(400).json({ message: 'Mã OTP không đúng' });
    if (user.verifyTokenExpiry < new Date())
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' });

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // Gửi email chào mừng (non-blocking)
    emailService.sendWelcomeVerifiedEmail(user.email, user.name).catch((err) =>
      console.error('[EMAIL] Lỗi gửi email chào mừng:', err.message)
    );

    res.json({ message: 'Xác thực email thành công! Chào mừng bạn đến TechStore 🎉' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/resend-otp
──────────────────────────────────────── */
exports.resendOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+verifyToken +verifyTokenExpiry');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    if (user.isVerified) return res.status(400).json({ message: 'Email đã được xác thực rồi' });

    const otp = makeOtp();
    user.verifyToken = otp;
    user.verifyTokenExpiry = new Date(Date.now() + Number(process.env.EMAIL_VERIFY_EXPIRES_MIN || 10) * 60_000);
    await user.save({ validateBeforeSave: false });

    // Gửi lại email OTP (non-blocking)
    emailService.sendVerifyEmail(user.email, user.name, otp).catch((err) =>
      console.error('[EMAIL] Lỗi gửi lại OTP:', err.message)
    );

    res.json({ message: 'Đã gửi lại mã OTP vào email của bạn' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/forgot-password
   Body: { email }
──────────────────────────────────────── */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });

    const user = await User.findOne({ email }).select('+resetToken +resetTokenExpiry');
    // Không tiết lộ email có tồn tại hay không
    if (!user) return res.json({ message: 'Nếu email tồn tại, chúng tôi đã gửi OTP đặt lại mật khẩu.' });

    const otp = makeOtp();
    user.resetToken = otp;
    user.resetTokenExpiry = new Date(Date.now() + Number(process.env.RESET_PASSWORD_EXPIRES_MIN || 15) * 60_000);
    await user.save({ validateBeforeSave: false });

    // Gửi email reset password (non-blocking)
    emailService.sendResetPasswordEmail(user.email, user.name, otp).catch((err) =>
      console.error('[EMAIL] Lỗi gửi email reset password:', err.message)
    );

    res.json({ message: 'Nếu email tồn tại, chúng tôi đã gửi OTP đặt lại mật khẩu.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/reset-password
   Body: { email, otp, newPassword }
──────────────────────────────────────── */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: 'Thiếu thông tin' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Mật khẩu phải ít nhất 6 ký tự' });

    const user = await User.findOne({ email }).select('+resetToken +resetTokenExpiry +password');
    if (!user || user.resetToken !== otp)
      return res.status(400).json({ message: 'OTP không đúng hoặc email không tồn tại' });
    if (user.resetTokenExpiry < new Date())
      return res.status(400).json({ message: 'OTP đã hết hạn. Vui lòng yêu cầu lại.' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/change-password (authenticated)
   Body: { currentPassword, newPassword }
──────────────────────────────────────── */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Thiếu thông tin' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   PUT /api/auth/profile (authenticated)
   Body: { name, phone, gender, dob }
──────────────────────────────────────── */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, dob } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, gender, dob },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Cập nhật thông tin thành công!', user: userPublic(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/refresh
──────────────────────────────────────── */
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'Không có refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: 'Refresh token không hợp lệ' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: 'Token hết hạn hoặc không hợp lệ' });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/logout
──────────────────────────────────────── */
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
      if (user) { user.refreshToken = null; await user.save({ validateBeforeSave: false }); }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Đăng xuất thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   GET /api/auth/me
──────────────────────────────────────── */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(userPublic(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/avatar
────────────────────────────────────────── */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Không có file được tải lên' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    // Xóa ảnh cũ nếu có
    if (user.avatar) {
      const fs = require('fs');
      const path = require('path');
      const oldFile = path.join(__dirname, '../../', user.avatar.replace(/^\//, ''));
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }

    // Lưu đường dẫn public
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ message: 'Cập nhật avatar thành công', user: userPublic(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   GET /api/auth/wishlist
────────────────────────────────────────── */
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'name slug price comparePrice thumbnail images discount rating reviewCount isFeatured brand category sku hasVariants variants serials'
    });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────
   POST /api/auth/wishlist/:productId
────────────────────────────────────────── */
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    
    res.json({ message: 'Đã cập nhật danh sách yêu thích', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
