const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const earningSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      default: "Credit",
      enum: ["Debit", "Credit"],
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
    },
    status: {
      type: Boolean,
      default: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Earning = mongoose.model("Earning", earningSchema);
module.exports = Earning;
