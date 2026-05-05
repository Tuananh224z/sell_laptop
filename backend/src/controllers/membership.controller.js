const User = require('../models/User');
const Tier = require('../models/Tier');
const Setting = require('../models/Setting');

/* ─── GET ALL MEMBERS & STATS ─── */
exports.getMembershipStats = async (req, res) => {
  try {
    const { search } = req.query;
    const tiers = await Tier.find().sort({ minPoints: 1 });
    
    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ totalSpent: -1 });

    // Calculate tier summary
    const summary = {};
    tiers.forEach(t => {
      summary[t.name] = {
        count: 0,
        minPoints: t.minPoints,
        discount: t.discount,
        color: t.color,
        icon: t.icon
      };
    });

    users.forEach(u => {
      if (summary[u.tier]) {
        summary[u.tier].count++;
      }
    });

    res.json({
      summary: Object.entries(summary).map(([name, data]) => ({ name, ...data })),
      users,
      tiers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET TIERS ─── */
exports.getTiers = async (req, res) => {
  try {
    const tiers = await Tier.find().sort({ minSpend: 1 });
    res.json(tiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── UPDATE TIER SETTINGS ─── */
exports.syncTiers = async (req, res) => {
  try {
    await syncAllUserTiers();
    res.json({ message: 'Đã đồng bộ lại toàn bộ hạng thành viên' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTierSettings = async (req, res) => {
  try {
    const { tiers } = req.body;
    
    // Get all current tier names in incoming list
    const incomingNames = tiers.map(t => t.name);
    
    // Remove tiers that are not in the new list
    await Tier.deleteMany({ name: { $nin: incomingNames } });

    // Upsert the ones we have
    for (const t of tiers) {
      await Tier.findOneAndUpdate(
        { name: t.name },
        { 
          minPoints: t.minPoints, 
          discount: t.discount, 
          color: t.color || '#6366f1', 
          icon: t.icon || '⭐',
          benefits: t.benefits || []
        },
        { upsert: true, new: true }
      );
    }

    // Trigger global sync for all users (background)
    syncAllUserTiers().catch(e => console.error('Global tier sync failed:', e));

    const updatedTiers = await Tier.find().sort({ minPoints: 1 });
    res.json(updatedTiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── HELPER: SYNC ALL USER TIERS ─── */
const syncAllUserTiers = async () => {
  const tiers = await Tier.find().sort({ minPoints: -1 });
  const users = await User.find({ role: 'user' });

  for (const user of users) {
    let newTier = tiers[tiers.length - 1]?.name || 'Thành viên';
    for (const t of tiers) {
      if (user.points >= t.minPoints) {
        newTier = t.name;
        break;
      }
    }
    if (user.tier !== newTier) {
      user.tier = newTier;
      await user.save({ validateBeforeSave: false });
    }
  }
};

/* ─── HELPER: UPDATE USER MEMBERSHIP ─── */
exports.updateUserMembership = async (userId, orderTotal) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const settings = await Setting.findOne() || { pointsPer1k: 1 };
    
    user.totalSpent += orderTotal;
    user.points += Math.floor((orderTotal / 1000) * settings.pointsPer1k); 
    user.orderCount += 1;
    user.lastOrderDate = new Date();

    // Update Tier dynamically based on NEW points
    const tiers = await Tier.find().sort({ minPoints: -1 });
    for (const t of tiers) {
      if (user.points >= t.minPoints) {
        user.tier = t.name;
        break;
      }
    }

    await user.save();
  } catch (err) {
    console.error('Update membership error:', err);
  }
};

/* ─── UPDATE USER POINTS MANUALLY ─── */
exports.updateUserPoints = async (req, res) => {
  try {
    const { points, note } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    user.points += Number(points);
    // You could save a point history here if needed
    await user.save();

    res.json({ message: 'Cập nhật điểm thành công', points: user.points });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getLoyaltySettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ pointsPer1k: settings.pointsPer1k });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLoyaltySettings = async (req, res) => {
  try {
    const { pointsPer1k, rankExpiryDays } = req.body;
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({ pointsPer1k, rankExpiryDays });
    } else {
      if (pointsPer1k !== undefined) settings.pointsPer1k = pointsPer1k;
      if (rankExpiryDays !== undefined) settings.rankExpiryDays = rankExpiryDays;
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── DEMOTION LOGIC ─── */
exports.checkAndDemoteUsers = async (req, res) => {
  try {
    const settings = await Setting.findOne() || { rankExpiryDays: 90 };
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - settings.rankExpiryDays);

    const usersToProcess = await User.find({
      role: 'user',
      lastOrderDate: { $lt: expiryDate },
      tier: { $ne: 'Thành viên' } // Only demote if not already at bottom
    });

    const tiers = await Tier.find().sort({ minPoints: 1 });
    let demotedCount = 0;

    for (const user of usersToProcess) {
      const currentTierIndex = tiers.findIndex(t => t.name === user.tier);
      if (currentTierIndex > 0) {
        // Demote one step
        const newTier = tiers[currentTierIndex - 1];
        user.tier = newTier.name;
        // Optional: reduce points to the max of the lower tier - 1 or something
        // But here we just move them down. 
        // We set their points to minPoints of the new tier to avoid immediate re-promotion
        // but maybe just below the next tier's minPoints.
        user.points = Math.min(user.points, tiers[currentTierIndex].minPoints - 1);
        user.lastOrderDate = new Date(); // Reset clock so they don't drop again tomorrow
        await user.save({ validateBeforeSave: false });
        demotedCount++;
      }
    }

    if (res) res.json({ message: `Đã xử lý xong. Có ${demotedCount} thành viên bị tụt hạng.`, demotedCount });
    return demotedCount;
  } catch (err) {
    if (res) res.status(500).json({ message: err.message });
    console.error('Demotion check failed:', err);
  }
};
