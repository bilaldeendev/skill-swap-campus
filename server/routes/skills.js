const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const SKILL_CATEGORIES = [
  'Programming & Tech', 'Design & Art', 'Music & Audio', 'Languages',
  'Mathematics', 'Science', 'Writing & Communication', 'Business & Finance',
  'Photography & Video', 'Cooking & Nutrition', 'Sports & Fitness',
  'Academic Support', 'Crafts & DIY', 'Other',
];

// @route GET /api/skills/categories
router.get('/categories', (req, res) => {
  res.json(SKILL_CATEGORIES);
});

// @route GET /api/skills/popular - Get most offered skills
router.get('/popular', protect, async (req, res) => {
  try {
    const result = await User.aggregate([
      { $unwind: '$skillsToTeach' },
      {
        $group: {
          _id: { name: '$skillsToTeach.name', category: '$skillsToTeach.category' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          category: '$_id.category',
          count: 1,
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/skills/stats - Platform stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalSkills = await User.aggregate([
      { $project: { count: { $size: '$skillsToTeach' } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);
    res.json({
      totalUsers,
      totalSkills: totalSkills[0]?.total || 0,
      categories: SKILL_CATEGORIES.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
