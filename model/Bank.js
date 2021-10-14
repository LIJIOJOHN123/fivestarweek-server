const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bankSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bankName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    IFSC: { type: String, default: null },
    accountHolderName: { type: String, default: null },
    UPI: { type: String, default: null },
    payPal: { type: String, default: null },
    preferece: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Bank = mongoose.model("Bank", bankSchema);
module.exports = Bank;
