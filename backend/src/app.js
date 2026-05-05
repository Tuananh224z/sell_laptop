require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect DB
connectDB();

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files (avatars, uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/users',       require('./routes/user.routes'));
app.use('/api/addresses',   require('./routes/address.routes'));
app.use('/api/categories',  require('./routes/category.routes'));
app.use('/api/brands',      require('./routes/brand.routes'));
app.use('/api/products',    require('./routes/product.routes'));
app.use('/api/cart',        require('./routes/cart.routes'));
app.use('/api/orders',      require('./routes/order.routes'));
app.use('/api/reviews',     require('./routes/review.routes'));
app.use('/api/coupons',     require('./routes/coupon.routes'));
app.use('/api/membership',  require('./routes/membership.routes'));
app.use('/api/support',      require('./routes/support.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/chat',          require('./routes/chat.routes'));
app.use('/api/settings',      require('./routes/setting.routes'));
app.use('/api/upload',        require('./routes/upload.routes'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((_, res) => res.status(404).json({ message: 'Route không tồn tại' }));

// Error handler
app.use((err, _, res, __) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi máy chủ' });
});

const http = require('http');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Init Socket
initSocket(server);

server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
