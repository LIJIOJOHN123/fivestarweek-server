const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const marketingSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
    },
    link: {
      type: String,
    },
    slug: {
      type: String,
    },
  },
  { timestamps: true }
);
const Marketing = mongoose.model("Marketing", marketingSchema);

module.exports = Marketing;
