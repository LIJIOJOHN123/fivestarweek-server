const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelViewIPSchema = new Schema(
  {
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

const ChannelViewIP = mongoose.model("ChannelViewIP", channelViewIPSchema);
module.exports = ChannelViewIP;
