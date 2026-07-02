const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    skillOffered: {
      name: { type: String, required: true },
      category: { type: String, required: true },
    },
    skillRequested: {
      name: { type: String, required: true },
      category: { type: String, required: true },
    },

    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60, enum: [30, 60, 90, 120] }, // minutes
    location: { type: String, default: 'Online / To be discussed' },
    notes: { type: String, default: '' },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'pending',
    },

    creditsExchanged: { type: Number, default: 5 },

    requesterReviewed: { type: Boolean, default: false },
    providerReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
