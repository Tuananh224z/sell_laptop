const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

const BACKEND = 'http://localhost:5000';

// helpers
const toUrl = (p) => p ? (p.startsWith('http') ? p : `${BACKEND}${p}`) : '';
const fromUrl = (url) => url ? url.replace(BACKEND, '') : '';

const deleteFile = (filePath) => {
  if (!filePath) return;
  const rel = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const abs = path.join(__dirname, '../../', rel.replace(/^\//, ''));
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
};

const toPublic = (p) => {
  const obj = p.toObject ? p.toObject({ virtuals: true }) : p;

  // Lấy giá mặc định
  let basePrice        = obj.price;
  let baseComparePrice = obj.comparePrice;
  if (obj.hasVariants && obj.variants?.length) {
    const def = obj.variants.find(v => v.isDefault) || obj.variants[0];
    basePrice        = def.price        || 0;
    baseComparePrice = def.comparePrice || 0;
  }

  return {
    ...obj,
    price:        basePrice,
    comparePrice: baseComparePrice,
    thumbnail: toUrl(obj.thumbnail),
    images: (obj.images || []).map(toUrl),
    videos: (obj.videos || []).map(toUrl),
    variants: (obj.variants || []).map(v => {
      const vPrice = v.price || 0;
      return {
        ...v,
        price: vPrice,
        images: (v.images || []).map(toUrl),
      };
    }),
    stock: p.stock,
    views: obj.views || 0,
    soldCount: obj.soldCount || 0,
    category: obj.category,
    brand: obj.brand,
  };
};

/* ─── List ─── */
exports.getAll = async (req, res) => {
  try {
    const { search, name, category, brand, status, isFeatured, page = 1, limit = 20, sortBy, sortOrder, minPrice, maxPrice } = req.query;
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (name)   filter.name = { $regex: name, $options: 'i' };
    if (status === 'active')   filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (isFeatured === 'true') filter.isFeatured = true;

    // Resolve category slug or ObjectId
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const Category = require('../models/Category');
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
        else filter.category = null; // no match → return empty
      }
    }

    // Resolve brand slug or ObjectId
    if (brand) {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        filter.brand = brand;
      } else {
        const Brand = require('../models/Brand');
        const br = await Brand.findOne({ slug: brand });
        if (br) filter.brand = br._id;
        else filter.brand = null;
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort
    let sort = { sortOrder: 1, createdAt: -1 };
    if (sortBy === 'price')      sort = { price: sortOrder === 'asc' ? 1 : -1 };
    if (sortBy === 'rating')     sort = { rating: -1 };
    if (sortBy === 'createdAt')  sort = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('brand', 'name slug logo')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products: products.map(p => toPublic(p)),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── One ─── */
exports.getOne = async (req, res) => {
  try {
    const q = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { slug: req.params.id };
    const p = await Product.findOne(q)
      .populate('category', '_id name slug')
      .populate('brand', '_id name slug logo');
    if (!p) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    res.json(toPublic(p));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── Helpers ─── */
const mongoose = require('mongoose');

const parseBody = (req) => {
  const d = req.body.data ? JSON.parse(req.body.data) : req.body;
  return d;
};

/* ─── Create ─── */
exports.create = async (req, res) => {
  try {
    const data = parseBody(req);
    const { name, slug, sku, shortDesc, description, category, brand,
            price, comparePrice, specGroups, hasVariants, variantOptions,
            variants, serials, isActive, isFeatured, isBestSeller, isNew,
            isHot, isSale, isGift, isExclusive, isLimited, tags, sortOrder } = data;

    if (!name || !slug || !sku) return res.status(400).json({ message: 'Tên, slug và SKU là bắt buộc' });

    // Existing checks
    const [slugEx, skuEx] = await Promise.all([
      Product.findOne({ slug }),
      Product.findOne({ sku }),
    ]);
    if (slugEx) return res.status(400).json({ message: 'Slug đã tồn tại' });
    if (skuEx)  return res.status(400).json({ message: 'SKU đã tồn tại' });

    // Images from uploaded files
    const imageFiles = (req.files?.images || []).map(f => `/uploads/products/${f.filename}`);
    const videoFiles = (req.files?.videos || []).map(f => `/uploads/videos/${f.filename}`);
    const thumbnail = imageFiles[0] || '';

    const product = await Product.create({
      name, slug, sku, shortDesc, description, category, brand,
      price: Number(price || 0), comparePrice: Number(comparePrice || 0),
      specGroups: specGroups || [],
      images: imageFiles,
      videos: videoFiles,
      thumbnail,
      hasVariants: !!hasVariants,
      variantOptions: variantOptions || [],
      variants: (variants || []).map(v => ({
        label: v.label, combo: v.combo,
        sku: v.sku || '',
        price: Number(v.price || v.salePrice || 0),
        comparePrice: Number(v.comparePrice || v.origPrice || 0),
        images: [], isDefault: !!v.isDefault,
        serials: (v.serials || []).map(s => ({
          code: s.code, status: s.status || 'available', note: s.note || '',
        })),
      })),
      serials: (serials || []).map(s => ({
        code: s.code, status: s.status || 'available', note: s.note || '',
      })),
      isActive: isActive !== false, isFeatured: !!isFeatured,
      isBestSeller: !!isBestSeller, isNew: !!isNew, isHot: !!isHot,
      isSale: !!isSale, isGift: !!isGift, isExclusive: !!isExclusive, isLimited: !!isLimited,
      tags: tags || [], sortOrder: Number(sortOrder || 0),
    });

    const pop = await product.populate(['category', 'brand']);
    res.status(201).json(toPublic(pop));
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};

/* ─── Update ─── */
exports.update = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const data = parseBody(req);
    const { name, slug, sku, shortDesc, description, category, brand,
            price, comparePrice, specGroups, hasVariants, variantOptions,
            variants, serials, removedImages, removedVideos,
            isActive, isFeatured, isBestSeller, isNew,
            isHot, isSale, isGift, isExclusive, isLimited, tags, sortOrder } = data;

    // Slug/sku uniqueness
    if (slug && slug !== product.slug) {
      const ex = await Product.findOne({ slug, _id: { $ne: product._id } });
      if (ex) return res.status(400).json({ message: 'Slug đã tồn tại' });
    }
    if (sku && sku !== product.sku) {
      const ex = await Product.findOne({ sku, _id: { $ne: product._id } });
      if (ex) return res.status(400).json({ message: 'SKU đã tồn tại' });
    }

    // Remove old files
    if (removedImages?.length) removedImages.forEach(url => deleteFile(fromUrl(url)));
    if (removedVideos?.length) removedVideos.forEach(url => deleteFile(fromUrl(url)));

    // New uploads
    const newImages = (req.files?.images || []).map(f => `/uploads/products/${f.filename}`);
    const newVideos = (req.files?.videos || []).map(f => `/uploads/videos/${f.filename}`);

    // Merge existing images (minus removed) + new
    const keptImages = product.images.filter(img => !removedImages?.includes(toUrl(img)));
    const keptVideos = product.videos.filter(vid => !removedVideos?.includes(toUrl(vid)));
    const allImages = [...keptImages, ...newImages];

    if (name !== undefined)        product.name = name;
    if (slug)                      product.slug = slug;
    if (sku)                       product.sku  = sku;
    if (shortDesc !== undefined)   product.shortDesc = shortDesc;
    if (description !== undefined) product.description = description;
    if (category)                  product.category = category;
    if (brand)                     product.brand = brand;
    if (price !== undefined)       product.price = Number(price);
    if (comparePrice !== undefined) product.comparePrice = Number(comparePrice);
    if (specGroups !== undefined)  product.specGroups = specGroups;
    if (hasVariants !== undefined) product.hasVariants = !!hasVariants;
    if (variantOptions !== undefined) product.variantOptions = variantOptions;

    if (variants !== undefined) {
      product.variants = variants.map(v => ({
        _id: v._id || new mongoose.Types.ObjectId(),
        label: v.label, combo: v.combo,
        sku: v.sku || '',
        price: Number(v.price || v.salePrice || 0),
        comparePrice: Number(v.comparePrice || v.origPrice || 0),
        images: v.images?.map(fromUrl) || [],
        isDefault: !!v.isDefault,
        serials: (v.serials || []).map(s => ({
          _id: s._id || new mongoose.Types.ObjectId(),
          code: s.code, status: s.status || 'available', note: s.note || '',
          soldAt: s.soldAt,
        })),
      }));
    }

    if (serials !== undefined) {
      product.serials = serials.map(s => ({
        _id: s._id || new mongoose.Types.ObjectId(),
        code: s.code, status: s.status || 'available', note: s.note || '',
        soldAt: s.soldAt,
      }));
    }

    product.images    = allImages;
    product.videos    = [...keptVideos, ...newVideos];
    product.thumbnail = allImages[0] || product.thumbnail;

    if (isActive !== undefined)    product.isActive    = isActive !== false;
    if (isFeatured !== undefined)  product.isFeatured  = !!isFeatured;
    if (isBestSeller !== undefined) product.isBestSeller = !!isBestSeller;
    if (isNew !== undefined)       product.isNew       = !!isNew;
    if (isHot !== undefined)       product.isHot       = !!isHot;
    if (isSale !== undefined)      product.isSale      = !!isSale;
    if (isGift !== undefined)      product.isGift      = !!isGift;
    if (isExclusive !== undefined) product.isExclusive = !!isExclusive;
    if (isLimited !== undefined)   product.isLimited   = !!isLimited;
    if (tags !== undefined)        product.tags        = tags;
    if (sortOrder !== undefined)   product.sortOrder   = Number(sortOrder);

    await product.save();
    const pop = await product.populate(['category', 'brand']);
    res.json(toPublic(pop));
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};

/* ─── Delete ─── */
exports.remove = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    // Delete all media files
    product.images.forEach(deleteFile);
    product.videos.forEach(deleteFile);
    product.variants.forEach(v => v.images.forEach(deleteFile));

    await product.deleteOne();
    res.json({ message: 'Đã xoá sản phẩm' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── Toggle Visibility ─── */
exports.toggleVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    product.isActive = !product.isActive;
    await product.save();
    const pop = await product.populate(['category', 'brand']);
    res.json(toPublic(pop));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── Serial APIs ─── */

// POST /api/products/:id/serials — add serials to product (non-variant)
exports.addSerials = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    const { serials } = req.body; // [{code, status, note}]
    if (!Array.isArray(serials) || serials.length === 0)
      return res.status(400).json({ message: 'Thiếu danh sách serial' });

    serials.forEach(s => {
      if (!s.code) return;
      const dup = product.serials.find(x => x.code === s.code);
      if (!dup) product.serials.push({ code: s.code, status: s.status || 'available', note: s.note || '' });
    });

    await product.save();
    res.json(toPublic(product));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/products/:id/serials/:serialId
exports.updateSerial = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    const serial = product.serials.id(req.params.serialId);
    if (!serial) return res.status(404).json({ message: 'Không tìm thấy serial' });
    const { status, note, code } = req.body;
    if (status) serial.status = status;
    if (note !== undefined) serial.note = note;
    if (code)  serial.code = code;
    await product.save();
    res.json(toPublic(product));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/products/:id/serials/:serialId
exports.deleteSerial = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    product.serials = product.serials.filter(s => s._id.toString() !== req.params.serialId);
    await product.save();
    res.json(toPublic(product));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/products/:id/variants/:variantId/serials
exports.addVariantSerials = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    const variant = product.variants.id(req.params.variantId);
    if (!variant) return res.status(404).json({ message: 'Không tìm thấy biến thể' });
    const { serials } = req.body;
    serials?.forEach(s => {
      if (!s.code) return;
      const dup = variant.serials.find(x => x.code === s.code);
      if (!dup) variant.serials.push({ code: s.code, status: s.status || 'available', note: s.note || '' });
    });
    await product.save();
    res.json(toPublic(product));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/products/:id/variants/:variantId/serials/:serialId
exports.updateVariantSerial = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    const variant = product.variants.id(req.params.variantId);
    if (!variant) return res.status(404).json({ message: 'Không tìm thấy biến thể' });
    const serial = variant.serials.id(req.params.serialId);
    if (!serial) return res.status(404).json({ message: 'Không tìm thấy serial' });
    const { status, note, code } = req.body;
    if (status) serial.status = status;
    if (note !== undefined) serial.note = note;
    if (code) serial.code = code;
    await product.save();
    res.json(toPublic(product));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/products/:id/variants/:variantId/serials/:serialId
exports.deleteVariantSerial = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    const variant = product.variants.id(req.params.variantId);
    if (!variant) return res.status(404).json({ message: 'Không tìm thấy biến thể' });
    variant.serials = variant.serials.filter(s => s._id.toString() !== req.params.serialId);
    await product.save();
    res.json(toPublic(product));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── Increment View ─── */
exports.incrementView = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ views: product.views });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── POS: Search Products ─── */
exports.getProductsPOS = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category && category !== 'Tất cả') {
       const Category = require('../models/Category');
       const cat = await Category.findOne({ name: category });
       if (cat) filter.category = cat._id;
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .limit(50);

    res.json(products.map(toPublic));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
