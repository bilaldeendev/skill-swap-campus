const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// @route GET /api/messages/conversations - Get all conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name avatar lastSeen')
      .populate('receiver', 'name avatar lastSeen')
      .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversationMap = new Map();
    messages.forEach((msg) => {
      const partnerId =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();
      const partner =
        msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      if (!msg.isRead && msg.receiver._id.toString() === userId.toString()) {
        const conv = conversationMap.get(partnerId);
        conv.unreadCount += 1;
      }
    });

    res.json(Array.from(conversationMap.values()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/messages/:userId - Get messages with a user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/messages - Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { receiver, content, messageType, attachedSession } = req.body;
    if (!receiver || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      messageType: messageType || 'text',
      attachedSession: attachedSession || null,
    });

    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    // Emit via socket (also handled client-side)
    const io = req.app.get('io');
    if (io) {
      io.to(receiver).emit('receiveMessage', message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
