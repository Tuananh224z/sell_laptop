const Category = require('../models/Category');
const path = require('path');
const fs = require('fs');

const BACKEND = process.env.CLIENT_URL ? '' : 'http://localhost:5000';

const toPublic = (cat) => ({
  _id: cat._id,
  name: cat.name,
  slug: cat.slug,
  image: cat.image ? (cat.image.startsWith('http') ? cat.image : `${BACKEND}${cat.image}`) : '',
  isVisible: cat.isVisible,
  sortOrder: cat.sortOrder,
  productCount: cat.productCount ?? 0,
  createdAt: cat.createdAt,
});

/* ─── GET /api/categories ─── */
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    const cats = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json(cats.map(toPublic));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── POST /api/categories ─── */
exports.create = async (req, res) => {
  try {
    const { name, slug, isVisible, sortOrder } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Tên và slug là bắt buộc' });

    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug đã tồn tại' });

    const image = req.file ? `/uploads/categories/${req.file.filename}` : '';
    const cat = await Category.create({ name, slug, image, isVisible: isVisible !== 'false', sortOrder: sortOrder || 0 });
    res.status(201).json(toPublic(cat));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── PUT /api/categories/:id ─── */
exports.update = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    const { name, slug, isVisible, sortOrder } = req.body;

    // Kiểm tra slug trùng (ngoài chính nó)
    if (slug && slug !== cat.slug) {
      const dup = await Category.findOne({ slug, _id: { $ne: cat._id } });
      if (dup) return res.status(400).json({ message: 'Slug đã tồn tại' });
    }

    // Ảnh mới → xóa ảnh cũ
    if (req.file) {
      if (cat.image) {
        const old = path.join(__dirname, '../../', cat.image.replace(/^\//, ''));
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      cat.image = `/uploads/categories/${req.file.filename}`;
    }

    if (name) cat.name = name;
    if (slug) cat.slug = slug;
    if (isVisible !== undefined) cat.isVisible = isVisible !== 'false';
    if (sortOrder !== undefined) cat.sortOrder = Number(sortOrder);

    await cat.save();
    res.json(toPublic(cat));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── DELETE /api/categories/:id ─── */
exports.remove = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    if (cat.image) {
      const file = path.join(__dirname, '../../', cat.image.replace(/^\//, ''));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }

    await cat.deleteOne();
    res.json({ message: 'Đã xoá danh mục' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── PATCH /api/categories/:id/visibility ─── */
exports.toggleVisibility = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    cat.isVisible = !cat.isVisible;
    await cat.save();
    res.json(toPublic(cat));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
