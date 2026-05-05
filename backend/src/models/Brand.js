const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    logo:      { type: String, default: '' },
    country:   { type: String, default: '' },
    website:   { type: String, default: '' },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', brandSchema);
