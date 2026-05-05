const Cart    = require('../models/Cart');
const Product = require('../models/Product');

const BACKEND = 'http://localhost:5000';
const toUrl = (p) => p ? (p.startsWith('http') ? p : `${BACKEND}${p}`) : '';

// Populate cart and return plain object
const populateCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name slug thumbnail images price comparePrice hasVariants variants sku stock',
  });
  if (!cart) return { items: [], itemCount: 0, subtotal: 0 };

  const items = cart.items.map(item => {
    const p = item.product;
    if (!p) return null;
    return {
      _id:          item._id,
      productId:    p._id,
      variantId:    item.variantId,
      variantLabel: item.variantLabel,
      name:         p.name,
      slug:         p.slug,
      sku:          p.sku,
      thumbnail:    toUrl(p.thumbnail || p.images?.[0] || ''),
      price:        item.price,
      comparePrice: item.comparePrice,
      quantity:     item.quantity,
      stock:        p.stock,
      subtotal:     item.price * item.quantity,
    };
  }).filter(Boolean);

  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal:  items.reduce((s, i) => s + i.subtotal, 0),
  };
};

/* ────────────────────────────
   GET /api/cart
──────────────────────────── */
exports.getCart = async (req, res) => {
  try {
    const data = await populateCart(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────
   POST /api/cart/add
   body: { productId, variantId?, quantity? }
──────────────────────────── */
exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'Thiếu productId' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    // Determine price
    let price        = product.price;
    let comparePrice = product.comparePrice;
    let variantLabel = '';

    if (product.hasVariants && variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) return res.status(404).json({ message: 'Không tìm thấy biến thể' });
      price        = variant.price        || product.price;
      comparePrice = variant.comparePrice || product.comparePrice;
      variantLabel = variant.label || '';
    } else if (product.hasVariants && product.variants.length > 0) {
      // default variant
      const def = product.variants.find(v => v.isDefault) || product.variants[0];
      price        = def.price        || product.price;
      comparePrice = def.comparePrice || product.comparePrice;
      variantLabel = def.label        || '';
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    // Check if same product+variant already in cart
    const existIndex = cart.items.findIndex(i =>
      i.product.toString() === productId &&
      String(i.variantId || '') === String(variantId || '')
    );

    if (existIndex >= 0) {
      cart.items[existIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, variantId: variantId || null, variantLabel, quantity: Number(quantity), price, comparePrice });
    }

    await cart.save();
    const data = await populateCart(req.user.id);
    res.json({ message: 'Đã thêm vào giỏ hàng', ...data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────
   PATCH /api/cart/:itemId
   body: { quantity }
──────────────────────────── */
exports.updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy mặt hàng' });

    if (Number(quantity) <= 0) {
      item.deleteOne();
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    const data = await populateCart(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────
   DELETE /api/cart/:itemId
──────────────────────────── */
exports.removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy mặt hàng' });

    item.deleteOne();
    await cart.save();
    const data = await populateCart(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────
   DELETE /api/cart
──────────────────────────── */
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.json({ items: [], itemCount: 0, subtotal: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
