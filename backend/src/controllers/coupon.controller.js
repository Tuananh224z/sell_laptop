const Coupon = require('../models/Coupon');

/* ─── GET ALL COUPONS (ADMIN) ─── */
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── CREATE COUPON ─── */
exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ─── UPDATE COUPON ─── */
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ─── DELETE COUPON ─── */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    res.json({ message: 'Đã xóa mã giảm giá thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── VALIDATE COUPON (FOR USERS) ─── */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ message: 'Mã giảm giá không hợp lệ' });

    const now = new Date();
    if (now < coupon.startDate) return res.status(400).json({ message: 'Mã giảm giá chưa đến ngày áp dụng' });
    if (now > coupon.endDate) return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString()}₫ để dùng mã này` });
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (orderValue * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    } else if (coupon.type === 'shipping') {
      // Logic for shipping discount handled in checkout usually, but we can return the benefit
      discountAmount = coupon.value; 
    }

    res.json({
      code: coupon.code,
      type: coupon.type,
      discountAmount,
      message: 'Áp dụng mã giảm giá thành công'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
