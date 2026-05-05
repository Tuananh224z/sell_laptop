const Brand = require('../models/Brand');
const path = require('path');
const fs = require('fs');

const BACKEND = process.env.CLIENT_URL ? '' : '';
const toPublic = (b) => ({
  _id: b._id,
  name: b.name,
  slug: b.slug,
  logo: b.logo ? (b.logo.startsWith('http') ? b.logo : `${BACKEND}${b.logo}`) : '',
  country: b.country,
  website: b.website,
  isVisible: b.isVisible,
  sortOrder: b.sortOrder,
  productCount: 0,
  createdAt: b.createdAt,
});

/* ─── GET /api/brands ─── */
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    const brands = await Brand.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json(brands.map(toPublic));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── POST /api/brands ─── */
exports.create = async (req, res) => {
  try {
    const { name, slug, country, website, isVisible, sortOrder } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Tên và slug là bắt buộc' });

    const exists = await Brand.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug đã tồn tại' });

    const logo = req.file ? `/uploads/brands/${req.file.filename}` : '';
    const brand = await Brand.create({ name, slug, logo, country, website, isVisible: isVisible !== 'false', sortOrder: sortOrder || 0 });
    res.status(201).json(toPublic(brand));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── PUT /api/brands/:id ─── */
exports.update = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });

    const { name, slug, country, website, isVisible, sortOrder } = req.body;

    if (slug && slug !== brand.slug) {
      const dup = await Brand.findOne({ slug, _id: { $ne: brand._id } });
      if (dup) return res.status(400).json({ message: 'Slug đã tồn tại' });
    }

    if (req.file) {
      if (brand.logo) {
        const old = path.join(__dirname, '../../', brand.logo.replace(/^\//, ''));
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      brand.logo = `/uploads/brands/${req.file.filename}`;
    }

    if (name) brand.name = name;
    if (slug) brand.slug = slug;
    if (country !== undefined) brand.country = country;
    if (website !== undefined) brand.website = website;
    if (isVisible !== undefined) brand.isVisible = isVisible !== 'false';
    if (sortOrder !== undefined) brand.sortOrder = Number(sortOrder);

    await brand.save();
    res.json(toPublic(brand));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── DELETE /api/brands/:id ─── */
exports.remove = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });

    if (brand.logo) {
      const file = path.join(__dirname, '../../', brand.logo.replace(/^\//, ''));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }

    await brand.deleteOne();
    res.json({ message: 'Đã xoá thương hiệu' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── PATCH /api/brands/:id/visibility ─── */
exports.toggleVisibility = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    brand.isVisible = !brand.isVisible;
    await brand.save();
    res.json(toPublic(brand));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
