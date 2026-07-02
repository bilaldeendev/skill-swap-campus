const express = require("express");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/users  -> browse/search users by skill or campus
router.get("/", requireAuth, async (req, res) => {
  try {
    const { q, campus } = req.query;
    const filter = { _id: { $ne: req.userId } };

    if (q) {
      filter.$or = [
        { skillsTeach: { $regex: q, $options: "i" } },
        { skillsLearn: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ];
    }
    if (campus) {
      filter.campus = { $regex: campus, $options: "i" };
    }

    const users = await User.find(filter).select("-password").limit(60);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Could not load users.", error: err.message });
  }
});

// GET /api/users/:id
router.get("/:id", requireAuth, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user });
});

// PATCH /api/users/me -> update own profile
router.patch("/me/update", requireAuth, async (req, res) => {
  try {
    const allowed = ["name", "campus", "bio", "skillsTeach", "skillsLearn", "avatarColor"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Could not update profile.", error: err.message });
  }
});

module.exports = router;
