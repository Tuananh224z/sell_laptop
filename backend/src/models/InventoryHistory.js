const mongoose = require('mongoose');

const inventoryHistorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String }, // optional, if product has variants
    type: { type: String, enum: ['import', 'export', 'return', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    serials: [{ type: String }], // list of serial codes affected
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // linked order if it's an export
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryHistory', inventoryHistorySchema);
