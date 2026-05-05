const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name:     { type: String, required: true },
        thumbnail:{ type: String },
        price:    { type: Number, required: true },
        quantity: { type: Number, required: true },
        variantId: { type: String },
        variantLabel: { type: String },
        serialCode:   { type: String },
      }
    ],
    shippingAddress: {
      name:     { type: String, required: true },
      phone:    { type: String, required: true },
      address:  { type: String, required: true },
      ward:     { type: String, required: true },
      district: { type: String, required: true },
      city:     { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['cod', 'banking', 'cash', 'card', 'transfer'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    orderStatus:   { type: String, enum: ['pending', 'processing', 'shipping', 'delivered', 'cancelled'], default: 'pending' },
    subtotal:      { type: Number, required: true },
    shippingFee:   { type: Number, default: 0 },
    total:         { type: Number, required: true },
    note:          { type: String, default: '' },
    isPOS:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
