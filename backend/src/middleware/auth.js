const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify access token
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Chưa đăng nhập' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Tài khoản không hợp lệ hoặc đã bị khóa' });

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    res.status(401).json({ message: 'Token hết hạn hoặc không hợp lệ' });
  }
};

// Admin only
exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
  next();
};

exports.requireAdmin = exports.isAdmin; // alias

// Optional verification (for public routes that might show personalized data)
exports.optionalVerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = { id: user._id.toString(), role: user.role, tier: user.tier };
      }
    }
    next();
  } catch {
    next();
  }
};
