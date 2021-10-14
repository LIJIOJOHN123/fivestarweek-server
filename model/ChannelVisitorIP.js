const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channleVisitIPSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    ip: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    keywords: [],
  },
  { timestamps: true }
);

const ChannelVisitIP = mongoose.model("ChannelVisitIP", channleVisitIPSchema);
module.exports = ChannelVisitIP;
