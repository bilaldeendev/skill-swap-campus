const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

// @route POST /api/reviews - Submit a review
router.post('/', protect, async (req, res) => {
  try {
    const { session: sessionId, reviewee, rating, comment } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed sessions' });
    }

    const isRequester = session.requester.toString() === req.user._id.toString();
    const isProvider = session.provider.toString() === req.user._id.toString();
    if (!isRequester && !isProvider) return res.status(403).json({ message: 'Not part of this session' });

    // Prevent double-reviewing
    if (isRequester && session.requesterReviewed) return res.status(400).json({ message: 'Already reviewed' });
    if (isProvider && session.providerReviewed) return res.status(400).json({ message: 'Already reviewed' });

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      session: sessionId,
      rating,
      comment,
      skillTaught: isRequester ? session.skillRequested.name : session.skillOffered.name,
    });

    // Update session review flags
    if (isRequester) session.requesterReviewed = true;
    else session.providerReviewed = true;
    await session.save();

    // Update user average rating
    const allReviews = await Review.find({ reviewee });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(reviewee, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    await review.populate('reviewer', 'name avatar');
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/reviews/:userId - Get reviews for a user
router.get('/:userId', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
