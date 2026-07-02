const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    campus: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },

    skillsToTeach: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
        description: { type: String, default: '' },
      },
    ],

    skillsToLearn: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
      },
    ],

    credits: { type: Number, default: 10 },
    totalSessionsTaught: { type: Number, default: 0 },
    totalSessionsLearned: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update badges based on activity
userSchema.methods.checkBadges = function () {
  const badges = [];
  if (this.totalSessionsTaught >= 1) badges.push({ name: 'First Teacher', icon: '🎓' });
  if (this.totalSessionsTaught >= 5) badges.push({ name: 'Mentor', icon: '🏆' });
  if (this.totalSessionsTaught >= 10) badges.push({ name: 'Expert Mentor', icon: '⭐' });
  if (this.totalSessionsLearned >= 5) badges.push({ name: 'Eager Learner', icon: '📚' });
  if (this.averageRating >= 4.5 && this.totalReviews >= 3) badges.push({ name: 'Top Rated', icon: '💎' });
  if (this.skillsToTeach.length >= 3) badges.push({ name: 'Multi-Skilled', icon: '🌟' });
  this.badges = badges;
};

module.exports = mongoose.model('User', userSchema);
