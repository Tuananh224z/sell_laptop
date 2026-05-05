const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'processing', 'resolved', 'closed'], 
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video'] },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
  }],
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Support', supportSchema);
