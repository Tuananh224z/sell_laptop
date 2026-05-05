const Setting = require('../models/Setting');
const path = require('path');
const fs = require('fs');

/* ─── GET SETTINGS (PUBLIC) ─── */
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── UPDATE SETTINGS (ADMIN) ─── */
exports.updateSettingsAdmin = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Xử lý files nếu có
    if (req.files) {
      if (req.files.logo)    data.logo    = `/uploads/settings/${req.files.logo[0].filename}`;
      if (req.files.banner1) data.banner1 = `/uploads/settings/${req.files.banner1[0].filename}`;
      if (req.files.banner2) data.banner2 = `/uploads/settings/${req.files.banner2[0].filename}`;
      if (req.files.banner3) data.banner3 = `/uploads/settings/${req.files.banner3[0].filename}`;
    }

    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(data);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, data, { new: true });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
