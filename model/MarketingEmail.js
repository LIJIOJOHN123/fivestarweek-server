const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const marketingEmailSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      Ref: "User",
    },
    email: {
      type: String,
    },
  },

  { timestamps: true }
);
const MarketingEmail = mongoose.model("MarketingEmail", marketingEmailSchema);

module.exports = MarketingEmail;
