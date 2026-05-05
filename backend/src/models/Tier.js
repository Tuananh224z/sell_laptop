const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
  name:      { type: String, required: true, unique: true },
  minPoints: { type: Number, required: true },
  discount:  { type: Number, default: 0 }, // Discount percentage for this tier
  color:     { type: String, default: '#6366f1' },
  icon:      { type: String, default: 'Award' },
  benefits:  [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Tier', tierSchema);
