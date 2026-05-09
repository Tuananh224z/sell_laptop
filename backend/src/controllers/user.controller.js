const User = require('../models/User');

// GET /api/users — admin only
exports.getUsers = async (req, res) => {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all') filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users — admin tạo user
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email đã tồn tại' });

    const user = await User.create({ name, email, phone, password, role: role || 'user' });
    res.status(201).json({ message: 'Tạo người dùng thành công', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, role, isActive },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Cập nhật thành công', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ message: `Tài khoản đã ${user.isActive ? 'kích hoạt' : 'khóa'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/reset-password — admin reset password
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' });
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
