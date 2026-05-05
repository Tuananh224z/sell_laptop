const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    image:     { type: String, default: '' },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: số sản phẩm (sẽ được populate nếu có Product model)
categorySchema.virtual('productCount').get(function () {
  return 0;
});

module.exports = mongoose.model('Category', categorySchema);
