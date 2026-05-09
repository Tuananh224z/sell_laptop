const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
      maxlength: [100, 'Tên không được quá 100 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    phone: { type: String, trim: true, default: '' },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải ít nhất 6 ký tự'],
      select: false,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    dob: { type: String, default: '' },

    // Email verification
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String, select: false },
    verifyTokenExpiry: { type: Date, select: false },

    // Password reset
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },

    // Auth
    refreshToken: { type: String, select: false },

    // Wishlist
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  },
  { timestamps: true }
);

// Hash password before save (mongoose v7+ async middleware — không dùng next())
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Virtual: initials
userSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
