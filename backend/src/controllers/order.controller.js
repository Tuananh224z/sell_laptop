const Order   = require('../models/Order');
const Cart    = require('../models/Cart');
const Address = require('../models/Address');

/* ─── Helper: Generate Order Number ─── */
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TS-${year}${month}${day}${random}`;
};

/* ─── CREATE ORDER ─── */
exports.createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, note } = req.body;

    // 1. Get Cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // 2. Get Shipping Address
    const addressDoc = await Address.findOne({ _id: addressId, user: req.user.id });
    if (!addressDoc) {
      return res.status(404).json({ message: 'Địa chỉ không hợp lệ' });
    }

    // 3. Prepare items & calculate subtotal
    let subtotal = 0;
    const orderItems = cart.items.map(item => {
      const p = item.product;
      if (!p) throw new Error('Sản phẩm không còn tồn tại');
      
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      return {
        product:   p._id,
        name:      p.name,
        thumbnail: p.thumbnail || (p.images && p.images[0]) || '',
        price:     item.price,
        quantity:  item.quantity,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
      };
    });

    const shippingFee = 50000;
    const total = subtotal + shippingFee;

    // 4. Create Order
    const order = await Order.create({
      user: req.user.id,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      shippingAddress: {
        name:     addressDoc.name,
        phone:    addressDoc.phone,
        address:  addressDoc.address,
        ward:     addressDoc.ward,
        district: addressDoc.district,
        city:     addressDoc.city,
      },
      paymentMethod: paymentMethod || 'cod',
      subtotal,
      shippingFee,
      total,
      note: note || '',
    });

    // 5. Clear Cart
    cart.items = [];
    await cart.save();

    // 6. Increment soldCount for products
    const Product = require('../models/Product');
    const soldPromises = orderItems.map(item => 
      Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.quantity } })
    );
    await Promise.all(soldPromises);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET MY ORDERS ─── */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET ORDER DETAIL ─── */
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── CANCEL ORDER ─── */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' });
    }

    order.orderStatus = 'cancelled';
    await order.save();
    res.json({ message: 'Đã hủy đơn hàng', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: GET ALL ORDERS ─── */
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: UPDATE ORDER STATUS ─── */
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    order.orderStatus = status;
    await order.save();

    // Membership update
    if (status === 'delivered' && order.user) {
      const membershipCtrl = require('./membership.controller');
      await membershipCtrl.updateUserMembership(order.user, order.total);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: CREATE POS ORDER ─── */
exports.createPOSOrder = async (req, res) => {
  try {
    const { items, paymentMethod, total, note } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    const Product = require('../models/Product');
    const orderNumber = `TS-POS-${Date.now().toString().slice(-8)}`;

    const newOrder = new Order({
      orderNumber,
      user: req.user.id, // Admin who sold this
      items: items.map(item => ({
        product:   item.productId,
        name:      item.productName,
        thumbnail: item.img || '',
        price:     item.price,
        quantity:  item.qty,
        variantId: item.variantId !== 'default' ? item.variantId : null,
        variantLabel: item.variantLabel,
        serialCode: item.serialCode
      })),
      shippingAddress: {
        name:     'Khách mua tại quầy',
        phone:    '0000000000',
        address:  'Tại quầy TechStore',
        ward:     'POS',
        district: 'POS',
        city:     'POS'
      },
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'paid',
      orderStatus:   'delivered',
      subtotal:      total,
      shippingFee:   0,
      total:         total,
      note:          note || '',
      isPOS:         true
    });

    await newOrder.save();

    // Membership update (if linked to a real customer)
    if (req.body.customerId) {
      const User = require('../models/User');
      const customer = await User.findById(req.body.customerId);
      if (customer) {
        newOrder.user = customer._id;
        await newOrder.save();
        const membershipCtrl = require('./membership.controller');
        await membershipCtrl.updateUserMembership(customer._id, total);
      }
    }

    // Update stock & serials
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        if (item.variantId && item.variantId !== 'default') {
          const variant = product.variants.id(item.variantId);
          if (variant) {
            const serial = variant.serials.find(s => s.code === item.serialCode);
            if (serial) {
              serial.status = 'sold';
              serial.soldAt = new Date();
            }
          }
        } else {
          const serial = product.serials.find(s => s.code === item.serialCode);
          if (serial) {
            serial.status = 'sold';
            serial.soldAt = new Date();
          }
        }
        product.soldCount += item.qty;
        await product.save();
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('POS Error:', err);
    res.status(500).json({ message: err.message });
  }
};
