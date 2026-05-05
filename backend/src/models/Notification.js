const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['all', 'tier', 'user'], 
    default: 'all' 
  },
  targetTier: { type: String }, // If type is 'tier'
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If type is 'user'
  channels: [{ 
    type: String, 
    enum: ['push', 'email', 'sms'] 
  }],
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sent'], 
    default: 'draft' 
  },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
