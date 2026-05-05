const Notification = require('../models/Notification');

/* ─── GET ALL NOTIFICATIONS (ADMIN) ─── */
exports.getAllNotificationsAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notifications = await Notification.find(query)
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 });

    // Summary stats
    const summary = {
      sent: await Notification.countDocuments({ status: 'sent' }),
      scheduled: await Notification.countDocuments({ status: 'scheduled' }),
      draft: await Notification.countDocuments({ status: 'draft' }),
      total: await Notification.countDocuments()
    };

    res.json({ notifications, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── CREATE NOTIFICATION ─── */
exports.createNotification = async (req, res) => {
  try {
    const { title, content, type, targetTier, targetUser, channels, status, scheduledAt } = req.body;
    const notification = await Notification.create({
      title,
      content,
      type,
      targetTier,
      targetUser: targetUser || null,
      channels,
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
      sentAt: status === 'sent' ? Date.now() : null,
      createdBy: req.user.id
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── UPDATE NOTIFICATION ─── */
exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── DELETE NOTIFICATION ─── */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    res.json({ message: 'Đã xoá thông báo' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET MY NOTIFICATIONS (USER) ─── */
exports.getMyNotifications = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    const notifications = await Notification.find({
      status: 'sent',
      $or: [
        { type: 'all' },
        { type: 'tier', targetTier: user.tier },
        { type: 'user', targetUser: req.user.id }
      ]
    }).sort({ sentAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
