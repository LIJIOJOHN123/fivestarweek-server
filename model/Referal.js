const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const referalSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referalLink: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    userId: {
      type: String,
    },
    image: {
      type: String,
    },
    usersRefered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  { timestamps: true }
);
const Referal = mongoose.model("Referal", referalSchema);

module.exports = Referal;
