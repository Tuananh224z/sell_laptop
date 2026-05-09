const Conversation = require('../models/Conversation');

/* ─── GET ALL CONVERSATIONS (ADMIN) ─── */
exports.getConversationsAdmin = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate('participants', 'name email avatar')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET OR CREATE CONVERSATION (USER) ─── */
exports.getConversationUser = async (req, res) => {
  try {
    let conv = await Conversation.findOne({
      participants: { $all: [req.user.id] },
    })
    .populate('participants', 'name avatar')
    .populate('messages.sender', 'name avatar role');

    if (!conv) {
      conv = await Conversation.create({
        participants: [req.user.id],
        messages: []
      });
      const populated = await Conversation.findById(conv._id).populate('participants', 'name avatar');
      const io = getIO();
      io.emit('new_conversation', populated);
    }
    res.json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET CONVERSATION DETAIL ─── */
exports.getConversationDetail = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id)
      .populate('participants', 'name avatar role')
      .populate('messages.sender', 'name avatar role');
    
    if (!conv) return res.status(404).json({ message: 'Không tìm thấy hội thoại' });

    // Mark messages as read
    let changed = false;
    conv.messages.forEach(m => {
      if (m.sender._id.toString() !== req.user.id && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
    });
    if (changed) await conv.save();

    res.json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { getIO } = require('../socket');

/* ─── SEND MESSAGE ─── */
exports.sendMessage = async (req, res) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;
    let conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Không tìm thấy hội thoại' });

    const msg = {
      sender: req.user.id,
      content,
      mediaUrl,
      mediaType,
      createdAt: new Date()
    };

    conv.messages.push(msg);
    conv.lastMessage = {
      sender: req.user.id,
      content,
      mediaUrl,
      mediaType,
      createdAt: msg.createdAt
    };

    await conv.save();

    // Emit via socket
    const io = getIO();
    const populatedConv = await Conversation.findById(conv._id)
      .populate('messages.sender', 'name avatar role');
    
    const savedMsg = populatedConv.messages[populatedConv.messages.length - 1];
    io.to(conv._id.toString()).emit('new_message', savedMsg);
    io.emit('admin_new_message', { conversationId: conv._id, message: savedMsg });

    res.status(201).json(savedMsg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const aiService = require('../services/aiService');

/* ─── CHAT WITH AI ─── */
exports.chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Convert history format if needed (Groq expects {role, content})
    const chatHistory = (history || []).map(h => ({
      role: h.sender?.role === 'bot' ? 'assistant' : 'user',
      content: h.content
    }));

    const response = await aiService.getAIConsultantResponse(message, chatHistory);
    
    res.json({
      _id: Date.now().toString(),
      sender: { role: 'bot', name: 'AI Consultant' },
      content: response,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
