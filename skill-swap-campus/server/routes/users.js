const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/users - Browse/search users
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, skill, campus, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'skillsToTeach.name': { $regex: search, $options: 'i' } },
        { campus: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query['skillsToTeach.category'] = category;
    if (skill) query['skillsToTeach.name'] = { $regex: skill, $options: 'i' };
    if (campus) query.campus = { $regex: campus, $options: 'i' };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ averageRating: -1, totalSessionsTaught: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ users, total, pages: Math.ceil(total / limit), current: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/users/:id - Get user profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ user, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/profile - Update own profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, campus, department, year, skillsToTeach, skillsToLearn } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (campus !== undefined) user.campus = campus;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (skillsToTeach) user.skillsToTeach = skillsToTeach;
    if (skillsToLearn) user.skillsToLearn = skillsToLearn;

    user.checkBadges();
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/password - Change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/users/admin/all - Admin: get all users
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/admin/:id/toggle - Admin: activate/deactivate user
router.put('/admin/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
