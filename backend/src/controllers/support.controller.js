const Support = require('../models/Support');

/* ─── USER: CREATE TICKET ─── */
exports.createTicket = async (req, res) => {
  try {
    const { subject, content, priority } = req.body;
    const ticket = await Support.create({
      user: req.user.id,
      subject,
      content,
      priority,
      messages: [{ sender: req.user.id, content }]
    });

    const populated = await Support.findById(ticket._id).populate('user', 'name email phone avatar');
    const io = getIO();
    io.emit('new_ticket', populated);

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── USER: GET MY TICKETS ─── */
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Support.find({ user: req.user.id }).sort({ lastMessageAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: GET ALL TICKETS ─── */
exports.getAllTicketsAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Support.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ lastMessageAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { getIO } = require('../socket');

/* ─── ADMIN/USER: REPLY TO TICKET ─── */
exports.replyTicket = async (req, res) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;
    const ticket = await Support.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });

    const newMessage = {
      sender: req.user.id,
      content,
      mediaUrl,
      mediaType
    };

    ticket.messages.push(newMessage);
    ticket.lastMessageAt = Date.now();

    if (req.user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'processing';
    }

    await ticket.save();

    // Emit via socket
    const io = getIO();
    const populatedTicket = await Support.findById(ticket._id)
      .populate('messages.sender', 'name avatar role');

    const savedMsg = populatedTicket.messages[populatedTicket.messages.length - 1];
    io.to(ticket._id.toString()).emit('new_message', savedMsg);

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: UPDATE STATUS ─── */
exports.updateStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: GET TICKET DETAIL ─── */
exports.getTicketDetail = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('messages.sender', 'name avatar role');
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });

    // Permission check: Admin or Owner
    const isOwner = ticket.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Bạn không có quyền xem yêu cầu này' });
    }

    // Mark messages as read if admin is viewing
    if (req.user.role === 'admin') {
      ticket.messages.forEach(m => {
        if (m.sender.toString() !== req.user.id) m.isRead = true;
      });
      await ticket.save();
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
