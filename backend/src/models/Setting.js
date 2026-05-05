const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'TechStore' },
  logo: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  zalo: { type: String },
  messenger: { type: String },
  facebook: { type: String },
  zaloUrl: { type: String },
  shippingFee: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  freeShipThreshold: { type: Number, default: 0 },
  pointsPer1k: { type: Number, default: 1 },
  rankExpiryDays: { type: Number, default: 90 }, // Days of inactivity before demotion
  logo: { type: String, default: '' },
  banner1: { type: String, default: '' },
  banner1Title: { type: String, default: '' },
  banner1Sub: { type: String, default: '' },
  banner2: { type: String, default: '' },
  banner2Title: { type: String, default: '' },
  banner2Sub: { type: String, default: '' },
  banner3: { type: String, default: '' },
  banner3Title: { type: String, default: '' },
  banner3Sub: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
