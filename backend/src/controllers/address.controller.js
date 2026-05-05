const Address = require('../models/Address');

/* ─── GET /api/addresses ─── */
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── POST /api/addresses ─── */
exports.createAddress = async (req, res) => {
  try {
    const { name, phone, address, ward, district, city, isDefault } = req.body;
    if (!name || !phone || !address || !city || !district || !ward)
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin địa chỉ' });

    // Nếu đặt làm mặc định → bỏ mặc định các địa chỉ khác
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const count = await Address.countDocuments({ user: req.user.id });
    const newAddr = await Address.create({
      user: req.user.id,
      name, phone, address, ward, district, city,
      isDefault: isDefault || count === 0, // Địa chỉ đầu tiên tự động là mặc định
    });

    res.status(201).json(newAddr);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── PUT /api/addresses/:id ─── */
exports.updateAddress = async (req, res) => {
  try {
    const { name, phone, address, ward, district, city, isDefault } = req.body;

    const addr = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!addr) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });

    if (isDefault && !addr.isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    Object.assign(addr, { name, phone, address, ward, district, city, isDefault });
    await addr.save();

    res.json(addr);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── DELETE /api/addresses/:id ─── */
exports.deleteAddress = async (req, res) => {
  try {
    const addr = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!addr) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    if (addr.isDefault) return res.status(400).json({ message: 'Không thể xóa địa chỉ mặc định' });

    await addr.deleteOne();
    res.json({ message: 'Đã xóa địa chỉ' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── PATCH /api/addresses/:id/default ─── */
exports.setDefault = async (req, res) => {
  try {
    const addr = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!addr) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });

    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    addr.isDefault = true;
    await addr.save();

    res.json({ message: 'Đã đặt làm địa chỉ mặc định', address: addr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
