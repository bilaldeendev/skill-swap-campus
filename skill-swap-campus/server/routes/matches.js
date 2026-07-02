const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route GET /api/matches - Get skill swap matches for current user
router.get('/', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const wantToLearn = currentUser.skillsToLearn.map((s) => s.name.toLowerCase());
    const canTeach = currentUser.skillsToTeach.map((s) => s.name.toLowerCase());

    if (wantToLearn.length === 0 && canTeach.length === 0) {
      return res.json({ matches: [], message: 'Add skills to your profile to find matches' });
    }

    // Find users who can teach what I want to learn AND want to learn what I can teach
    const potentialMatches = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      $or: [
        { 'skillsToTeach.name': { $in: wantToLearn.map((s) => new RegExp(s, 'i')) } },
        { 'skillsToLearn.name': { $in: canTeach.map((s) => new RegExp(s, 'i')) } },
      ],
    }).select('-password').limit(20);

    // Score each match
    const scored = potentialMatches.map((user) => {
      const theyTeach = user.skillsToTeach.map((s) => s.name.toLowerCase());
      const theyLearn = user.skillsToLearn.map((s) => s.name.toLowerCase());

      const theyTeachWhatIWant = wantToLearn.filter((s) =>
        theyTeach.some((t) => t.includes(s) || s.includes(t))
      );
      const theyWantWhatITeach = canTeach.filter((s) =>
        theyLearn.some((t) => t.includes(s) || s.includes(t))
      );

      const matchScore = theyTeachWhatIWant.length + theyWantWhatITeach.length;
      const isMutual = theyTeachWhatIWant.length > 0 && theyWantWhatITeach.length > 0;

      return {
        user,
        matchScore,
        isMutual,
        theyCanTeach: theyTeachWhatIWant,
        theyWantToLearn: theyWantWhatITeach,
      };
    });

    const sorted = scored
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => b.isMutual - a.isMutual || b.matchScore - a.matchScore);

    res.json({ matches: sorted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
