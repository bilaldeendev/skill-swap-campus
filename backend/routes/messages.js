const express = require("express");
const Message = require("../models/Message");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/messages/:userId -> conversation thread with a specific user
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.userId },
      ],
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Could not load conversation.", error: err.message });
  }
});

// POST /api/messages -> send a message
router.post("/", requireAuth, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    if (!recipientId || !text) {
      return res.status(400).json({ message: "Recipient and message text are required." });
    }

    const message = await Message.create({
      sender: req.userId,
      recipient: recipientId,
      text,
    });

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: "Could not send message.", error: err.message });
  }
});

// GET /api/messages -> list of conversations (latest message per contact)
router.get("/", requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { recipient: req.userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name avatarColor")
      .populate("recipient", "name avatarColor");

    const seen = new Set();
    const conversations = [];
    for (const m of messages) {
      const otherId =
        m.sender._id.toString() === req.userId ? m.recipient._id.toString() : m.sender._id.toString();
      if (seen.has(otherId)) continue;
      seen.add(otherId);
      const other = m.sender._id.toString() === req.userId ? m.recipient : m.sender;
      conversations.push({ user: other, lastMessage: m.text, lastAt: m.createdAt });
    }

    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ message: "Could not load conversations.", error: err.message });
  }
});

module.exports = router;
