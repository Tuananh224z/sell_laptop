const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null // for percentage coupons
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
