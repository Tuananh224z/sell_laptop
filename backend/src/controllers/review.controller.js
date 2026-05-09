const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

const resolveProductId = async (idOrSlug) => {
  if (require('mongoose').Types.ObjectId.isValid(idOrSlug)) return idOrSlug;
  const p = await Product.findOne({ slug: idOrSlug });
  return p ? p._id : null;
};

exports.createReview = async (req, res) => {
  try {
    const { productId: idOrSlug } = req.params;
    const productId = await resolveProductId(idOrSlug);
    if (!productId) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const { rating, comment } = req.body;

    const order = await Order.findOne({
      user: req.user.id,
      'items.product': productId,
      orderStatus: 'delivered'
    });

    if (!order) {
      return res.status(403).json({ 
        message: 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng và nhận được hàng thành công!' 
      });
    }

    const existing = await Review.findOne({ product: productId, user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi!' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      rating: Number(rating),
      comment,
      status: 'pending' // Chờ admin duyệt
    });

    const pop = await review.populate('user', 'name avatar');
    res.status(201).json(pop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId: idOrSlug } = req.params;
    const productId = await resolveProductId(idOrSlug);
    if (!productId) return res.json([]); // No product, no reviews

    const reviews = await Review.find({ product: productId, status: 'approved' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkCanReview = async (req, res) => {
  try {
    const { productId: idOrSlug } = req.params;
    const productId = await resolveProductId(idOrSlug);
    if (!productId) return res.json({ canReview: false, reason: 'Sản phẩm không tồn tại' });

    const order = await Order.findOne({
      user: req.user.id,
      'items.product': productId,
      orderStatus: 'delivered'
    });
    
    const existing = await Review.findOne({ product: productId, user: req.user.id });
    
    res.json({ 
      canReview: !!order && !existing,
      reason: !order ? 'Chưa mua hàng' : (existing ? 'Đã đánh giá' : null)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: GET ALL REVIEWS ─── */
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    
    const reviews = await Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('product', 'name thumbnail')
      .sort({ createdAt: -1 });

    let filtered = reviews;
    if (search) {
      const s = search.toLowerCase();
      filtered = reviews.filter(r => 
        r.user?.name?.toLowerCase().includes(s) || 
        r.product?.name?.toLowerCase().includes(s) ||
        r.comment?.toLowerCase().includes(s)
      );
    }
    res.json(filtered);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── ADMIN: UPDATE STATUS ─── */
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

    review.status = status;
    await review.save();

    // Cập nhật rating sản phẩm dựa trên các đánh giá ĐÃ DUYỆT
    const productId = review.product;
    const reviews = await Review.find({ product: productId, status: 'approved' });
    const numReviews = reviews.length;
    const avgRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      numReviews: numReviews
    });

    const pop = await review.populate(['user', 'product']);
    res.json(pop);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── ADMIN: REPLY ─── */
exports.replyToReview = async (req, res) => {
  try {
    const { content } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, {
      reply: {
        content,
        repliedAt: new Date(),
        repliedBy: req.user.id
      }
    }, { new: true }).populate(['user', 'product']);

    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── ADMIN: DELETE ─── */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

    const productId = review.product;
    await review.deleteOne();

    const reviews = await Review.find({ product: productId, status: 'approved' });
    const numReviews = reviews.length;
    const avgRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      numReviews: numReviews
    });

    res.json({ message: 'Đã xoá đánh giá' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
