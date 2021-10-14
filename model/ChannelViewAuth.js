const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelViewAuthSchema = new Schema(
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

const ChannelViewAuth = mongoose.model(
  "ChannelViewAuth",
  channelViewAuthSchema
);
module.exports = ChannelViewAuth;
