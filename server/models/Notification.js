const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['session-request', 'session-accepted', 'session-declined', 'session-completed',
             'new-message', 'new-review', 'badge-earned', 'match-found', 'session-reminder'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    relatedSession: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
