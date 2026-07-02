const express = require("express");
const Review = require("../models/Review");
const User = require("../models/User");
const Session = require("../models/Session");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// POST /api/reviews -> leave a review after a completed session
router.post("/", requireAuth, async (req, res) => {
  try {
    const { sessionId, revieweeId, rating, comment } = req.body;
    if (!sessionId || !revieweeId || !rating) {
      return res.status(400).json({ message: "Session, reviewee and rating are required." });
    }

    const session = await Session.findById(sessionId);
    if (!session || session.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed sessions." });
    }

    const review = await Review.create({
      session: sessionId,
      reviewer: req.userId,
      reviewee: revieweeId,
      rating,
      comment,
    });

    const reviewee = await User.findById(revieweeId);
    const newCount = reviewee.ratingCount + 1;
    const newRating = (reviewee.rating * reviewee.ratingCount + rating) / newCount;
    reviewee.rating = newRating;
    reviewee.ratingCount = newCount;
    await reviewee.save();

    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: "Could not submit review.", error: err.message });
  }
});

// GET /api/reviews/:userId -> reviews for a user
router.get("/:userId", requireAuth, async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate("reviewer", "name avatarColor")
    .sort({ createdAt: -1 });
  res.json({ reviews });
});

module.exports = router;
