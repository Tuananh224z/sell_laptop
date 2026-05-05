const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId:   { type: mongoose.Schema.Types.ObjectId, default: null },   // null = no variant
  variantLabel:{ type: String, default: '' },
  quantity:    { type: Number, required: true, min: 1, default: 1 },
  price:       { type: Number, required: true },        // snapshot price at add-time
  comparePrice:{ type: Number, default: 0 },
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
}, { timestamps: true });

// Virtual: total items count
cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

// Virtual: subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
