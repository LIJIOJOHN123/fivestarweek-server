const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const acitivityHistorySchema = new Schema(
  {
    action: {
      type: String,
    },
    type: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approved: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

const AcitivityHistory = mongoose.model(
  "AcitivityHistory",
  acitivityHistorySchema
);
module.exports = AcitivityHistory;
