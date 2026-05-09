const InventoryHistory = require('../models/InventoryHistory');
const Product = require('../models/Product');

// GET /api/inventory/history
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, productId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (productId) filter.product = productId;

    const skip = (Number(page) - 1) * Number(limit);
    const [history, total] = await Promise.all([
      InventoryHistory.find(filter)
        .populate('product', 'name thumbnail sku')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InventoryHistory.countDocuments(filter)
    ]);

    res.json({
      history,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/inventory/import
exports.importStock = async (req, res) => {
  try {
    const { productId, variantId, serials, note } = req.body;
    if (!productId || !serials || !Array.isArray(serials)) {
      return res.status(400).json({ message: 'Thiếu thông tin nhập kho' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    // 1. Update Product Serials
    if (variantId && product.hasVariants) {
      const variant = product.variants.id(variantId);
      if (!variant) return res.status(404).json({ message: 'Không tìm thấy biến thể' });
      serials.forEach(code => {
        if (!variant.serials.find(s => s.code === code)) {
          variant.serials.push({ code, status: 'available' });
        }
      });
    } else {
      serials.forEach(code => {
        if (!product.serials.find(s => s.code === code)) {
          product.serials.push({ code, status: 'available' });
        }
      });
    }

    await product.save();

    // 2. Create History Record
    const history = await InventoryHistory.create({
      product: productId,
      variantId,
      type: 'import',
      quantity: serials.length,
      serials,
      note,
      createdBy: req.user.id
    });

    res.status(201).json({ message: 'Nhập kho thành công', history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
