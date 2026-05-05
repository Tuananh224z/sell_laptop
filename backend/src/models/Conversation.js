const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video'] },
    createdAt: { type: Date, default: Date.now }
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video'] },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
