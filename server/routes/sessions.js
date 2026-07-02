const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const createNotification = async (io, recipient, type, title, message, extras = {}) => {
  const notif = await Notification.create({ recipient, type, title, message, ...extras });
  if (io) io.to(recipient.toString()).emit('newNotification', notif);
};

// @route POST /api/sessions - Request a session
router.post('/', protect, async (req, res) => {
  try {
    const { provider, skillOffered, skillRequested, scheduledAt, duration, location, notes } = req.body;

    if (provider === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request a session with yourself' });
    }

    const session = await Session.create({
      requester: req.user._id,
      provider,
      skillOffered,
      skillRequested,
      scheduledAt,
      duration: duration || 60,
      location: location || 'Online / To be discussed',
      notes,
    });

    await session.populate(['requester', 'provider'], 'name avatar email');

    const io = req.app.get('io');
    await createNotification(io, provider, 'session-request',
      'New Swap Request!',
      `${req.user.name} wants to swap "${skillOffered.name}" for your "${skillRequested.name}"`,
      { relatedUser: req.user._id, relatedSession: session._id, link: '/schedule' }
    );

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/sessions - Get my sessions
router.get('/', protect, async (req, res) => {
  try {
    const { status, role } = req.query;
    const query = {
      $or: [{ requester: req.user._id }, { provider: req.user._id }],
    };
    if (status) query.status = status;
    if (role === 'requester') delete query.$or, query.requester = req.user._id;
    if (role === 'provider') delete query.$or, query.provider = req.user._id;

    const sessions = await Session.find(query)
      .populate('requester', 'name avatar email averageRating')
      .populate('provider', 'name avatar email averageRating')
      .sort({ scheduledAt: 1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/sessions/:id/respond - Accept or decline
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    const session = await Session.findById(req.params.id)
      .populate('requester', 'name avatar')
      .populate('provider', 'name avatar');

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.provider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (session.status !== 'pending') {
      return res.status(400).json({ message: 'Session already responded to' });
    }

    session.status = action === 'accept' ? 'accepted' : 'declined';
    await session.save();

    const io = req.app.get('io');
    const notifType = action === 'accept' ? 'session-accepted' : 'session-declined';
    const notifMsg = action === 'accept'
      ? `${req.user.name} accepted your swap request for "${session.skillRequested.name}"`
      : `${req.user.name} declined your swap request`;

    await createNotification(io, session.requester._id, notifType,
      action === 'accept' ? 'Swap Accepted! 🎉' : 'Swap Declined',
      notifMsg,
      { relatedUser: session.provider._id, relatedSession: session._id, link: '/schedule' }
    );

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/sessions/:id/complete - Mark as completed
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('requester', 'name')
      .populate('provider', 'name');

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'accepted') {
      return res.status(400).json({ message: 'Session must be accepted first' });
    }

    const isInvolved =
      session.requester._id.toString() === req.user._id.toString() ||
      session.provider._id.toString() === req.user._id.toString();
    if (!isInvolved) return res.status(403).json({ message: 'Not authorized' });

    session.status = 'completed';
    await session.save();

    // Update user stats
    await User.findByIdAndUpdate(session.requester._id, {
      $inc: { totalSessionsLearned: 1, credits: session.creditsExchanged },
    });
    await User.findByIdAndUpdate(session.provider._id, {
      $inc: { totalSessionsTaught: 1, credits: session.creditsExchanged },
    });

    const io = req.app.get('io');
    await createNotification(io, session.requester._id, 'session-completed',
      'Session Completed! ⭐', 'Don\'t forget to leave a review for your swap partner.',
      { relatedSession: session._id, link: '/schedule' }
    );
    await createNotification(io, session.provider._id, 'session-completed',
      'Session Completed! ⭐', 'Don\'t forget to leave a review for your swap partner.',
      { relatedSession: session._id, link: '/schedule' }
    );

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/sessions/:id/cancel - Cancel session
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isInvolved =
      session.requester.toString() === req.user._id.toString() ||
      session.provider.toString() === req.user._id.toString();
    if (!isInvolved) return res.status(403).json({ message: 'Not authorized' });
    if (['completed', 'cancelled'].includes(session.status)) {
      return res.status(400).json({ message: 'Cannot cancel this session' });
    }

    session.status = 'cancelled';
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
