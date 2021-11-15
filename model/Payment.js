const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      Ref: "User",
    },
    description: {
      type: String,
    },
    payId: {
      type: String,
    },
    type: {
      type: String,
      default: "Debit",
      enum: ["Debit", "Credit"],
    },
    amount: {
      type: Number,
    },
    balance: {
      type: Number,
    },
  },

  { timestamps: true }
);
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
