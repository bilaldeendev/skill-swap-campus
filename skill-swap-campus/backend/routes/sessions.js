const express = require("express");
const Session = require("../models/Session");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// POST /api/sessions -> request a session (learner requests teacher)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { teacherId, skill, dateTime, durationMinutes, location, notes } = req.body;

    if (!teacherId || !skill || !dateTime) {
      return res.status(400).json({ message: "Teacher, skill and date/time are required." });
    }
    if (teacherId === req.userId) {
      return res.status(400).json({ message: "You can't book a session with yourself." });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    const session = await Session.create({
      teacher: teacherId,
      learner: req.userId,
      skill,
      dateTime,
      durationMinutes,
      location,
      notes,
    });

    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ message: "Could not create session.", error: err.message });
  }
});

// GET /api/sessions/mine -> all sessions where I'm teacher or learner
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacher: req.userId }, { learner: req.userId }],
    })
      .populate("teacher", "name avatarColor")
      .populate("learner", "name avatarColor")
      .sort({ dateTime: 1 });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Could not load sessions.", error: err.message });
  }
});

// PATCH /api/sessions/:id/status -> confirm / decline / cancel / complete
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["confirmed", "completed", "cancelled", "declined"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found." });

    const isParty =
      session.teacher.toString() === req.userId || session.learner.toString() === req.userId;
    if (!isParty) return res.status(403).json({ message: "Not your session to update." });

    session.status = status;
    await session.save();

    // Award a credit to the teacher when a session is marked completed
    if (status === "completed") {
      await User.findByIdAndUpdate(session.teacher, { $inc: { credits: 1 } });
      await User.findByIdAndUpdate(session.learner, { $inc: { credits: -1 } });
    }

    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: "Could not update session.", error: err.message });
  }
});

module.exports = router;
