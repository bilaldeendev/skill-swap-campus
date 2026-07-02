const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, campus, department, year, skillsToTeach, skillsToLearn } = req.body;

    try {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });

      const user = await User.create({
        name, email, password, campus, department, year,
        skillsToTeach: skillsToTeach || [],
        skillsToLearn: skillsToLearn || [],
      });

      res.status(201).json({
        token: generateToken(user._id),
        user: {
          _id: user._id, name: user.name, email: user.email,
          avatar: user.avatar, credits: user.credits, role: user.role,
          skillsToTeach: user.skillsToTeach, skillsToLearn: user.skillsToLearn,
          campus: user.campus, department: user.department, year: user.year,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// @route POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      if (!user.isActive) return res.status(403).json({ message: 'Account has been deactivated' });

      user.lastSeen = new Date();
      await user.save({ validateBeforeSave: false });

      res.json({
        token: generateToken(user._id),
        user: {
          _id: user._id, name: user.name, email: user.email,
          avatar: user.avatar, credits: user.credits, role: user.role,
          skillsToTeach: user.skillsToTeach, skillsToLearn: user.skillsToLearn,
          campus: user.campus, department: user.department, year: user.year,
          badges: user.badges, averageRating: user.averageRating,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
