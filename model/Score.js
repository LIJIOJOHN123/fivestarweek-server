const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scoreSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    activity: {
      type: String,
    },
    description: {
      type: String,
    },
    mode: {
      type: String,
      enum: ["Debit", "Credit"],
    },
    points: {
      type: Number,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    request: {
      type: Boolean,
      default: true,
    },
    requestedPoint: {
      type: Number,
    },
  },

  { timestamps: true }
);
const Score = mongoose.model("Score", scoreSchema);

module.exports = Score;
