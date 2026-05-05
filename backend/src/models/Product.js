const mongoose = require('mongoose');

const serialSchema = new mongoose.Schema({
  code: { type: String, required: true },
  status: { type: String, enum: ['available', 'sold', 'defective', 'reserved'], default: 'available' },
  note: { type: String, default: '' },
  soldAt: { type: Date },
}, { _id: true });

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true },
  combo: { type: Map, of: String },
  sku: { type: String, default: '' },
  price: { type: Number, default: 0 },
  comparePrice: { type: Number, default: 0 },
  images: [{ type: String }],
  isDefault: { type: Boolean, default: false },
  serials: [serialSchema],
}, { _id: true });

const specItemSchema = new mongoose.Schema({ key: String, value: String }, { _id: false });
const specGroupSchema = new mongoose.Schema({ name: String, items: [specItemSchema] }, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true },
  shortDesc: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  price: { type: Number, default: 0 },
  comparePrice: { type: Number, default: 0 },

  // Specs grouped
  specGroups: [specGroupSchema],

  // Media
  images: [{ type: String }],
  videos: [{ type: String }],
  thumbnail: { type: String, default: '' },

  // Variant system
  hasVariants: { type: Boolean, default: false },
  variantOptions: [{
    name: { type: String },
    values: [{ type: String }],
  }],
  variants: [variantSchema],

  // For non-variant products
  serials: [serialSchema],

  // Flags
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isHot: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  isGift: { type: Boolean, default: false },
  isExclusive: { type: Boolean, default: false },
  isLimited: { type: Boolean, default: false },

  tags: [{ type: String }],
  sortOrder: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual: stock
productSchema.virtual('stock').get(function () {
  if (this.hasVariants) {
    return (this.variants || []).reduce((sum, v) => sum + (v.serials || []).filter(s => s.status === 'available').length, 0);
  }
  return (this.serials || []).filter(s => s.status === 'available').length;
});

// Indexes
productSchema.index({ name: 'text', sku: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
