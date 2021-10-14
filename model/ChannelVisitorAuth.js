const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelVisitAuthSchema = new Schema(
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

const ChannelVisitAuth = mongoose.model(
  "ChannelVisitAuth",
  channelVisitAuthSchema
);
module.exports = ChannelVisitAuth;
