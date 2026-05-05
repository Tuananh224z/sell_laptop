const multer = require('multer');
const path = require('path');
const fs = require('fs');

const makeStorage = (folder) => {
  const dir = path.join(__dirname, `../../uploads/${folder}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (_, __, cb) => cb(null, dir),
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${folder}_${Date.now()}${ext}`);
    },
  });
};

const imageFilter = (_, file, cb) => {
  const ok = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (ok.includes(ext)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)'), false);
};

const videoFilter = (_, file, cb) => {
  const ok = ['.mp4', '.webm', '.mov', '.avi'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (ok.includes(ext)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận file video (MP4, WEBM, MOV)'), false);
};

exports.avatarUpload   = multer({ storage: makeStorage('avatars'),    fileFilter: imageFilter, limits: { fileSize: 1   * 1024 * 1024 } });
exports.categoryUpload = multer({ storage: makeStorage('categories'), fileFilter: imageFilter, limits: { fileSize: 2   * 1024 * 1024 } });
exports.brandUpload    = multer({ storage: makeStorage('brands'),     fileFilter: imageFilter, limits: { fileSize: 2   * 1024 * 1024 } });
exports.productUpload  = multer({ storage: makeStorage('products'),   fileFilter: imageFilter, limits: { fileSize: 5   * 1024 * 1024 } });
exports.videoUpload    = multer({ storage: makeStorage('videos'),     fileFilter: videoFilter, limits: { fileSize: 200 * 1024 * 1024 } });
exports.settingsUpload = multer({ storage: makeStorage('settings'),   fileFilter: imageFilter, limits: { fileSize: 5   * 1024 * 1024 } });

// Combined: images + videos in one request
exports.productMediaUpload = multer({
  storage: multer.diskStorage({
    destination: (_, file, cb) => {
      const isVideo = ['.mp4', '.webm', '.mov', '.avi'].includes(path.extname(file.originalname).toLowerCase());
      const dir = path.join(__dirname, `../../uploads/${isVideo ? 'videos' : 'products'}`);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const prefix = ['.mp4', '.webm', '.mov', '.avi'].includes(ext) ? 'video' : 'product';
      cb(null, `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
});
