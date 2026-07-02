const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: String, required: true, trim: true },
    dateTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    location: { type: String, default: "TBD", trim: true }, // e.g. "Library Room 2" or "Online"
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "declined"],
      default: "pending",
    },
    notes: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
