const mongoose = require("mongoose");
const AppConstant = require("../config/appConstants");
const Schema = mongoose.Schema;

const channelSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: String,
    },
    channelId: {
      type: String,
    },
    channelName: {
      type: String,
      unique: true,
      required: true,
    },
    introduction: {
      type: String,
    },
    language: {
      type: String,
    },
    keywords: {
      type: String,
    },
    home: {
      type: Boolean,
      default: false,
    },
    verifiedStatus: {
      type: Number,
      default: AppConstant.CHANNEL_VERIFICATION.NORMAL,
      enum: [
        AppConstant.CHANNEL_VERIFICATION.NORMAL,
        AppConstant.CHANNEL_VERIFICATION.VERIFIED,
      ],
    },
    avatar: {
      image: {
        type: String,
        default: process.env.CHANNEL_AVATAR,
      },
      zoom: {
        type: String,
        default: "100%",
      },
    },
    slur: {
      type: String,
    },
    language: {
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
    category: {
      type: String,
    },
    subcategory: {
      type: String,
    },
    keyword: [],
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
    avatars: [
      {
        image: {
          type: String,
          default: process.CHANNEL_AVATAR,
        },
        zoom: {
          type: String,
          default: "100%",
        },
      },
    ],
    violation: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
        },
      },
    ],
    sponsor: {
      type: Number,
      default: AppConstant.SPONSOR.NORMAL,
      enum: [
        AppConstant.SPONSOR.NORMAL,
        AppConstant.SPONSOR.REQUEST_PENDING,
        AppConstant.SPONSOR.SPONSORED,
        AppConstant.SPONSOR.REJECTED,
        AppConstant.SPONSOR.PAUSED,
      ],
    },
    visitIP: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChannelVisitIP",
      },
    ],
    visit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChannelVisitAuth",
      },
    ],
    viewIP: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChannelViewIP",
      },
    ],
    view: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChannelViewAuth",
      },
    ],
    follows: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        channel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Channel",
        },
      },
    ],
    status: {
      type: Number,
      default: AppConstant.CHANNEL_STATUS.ACTIVE,
      enum: [
        AppConstant.CHANNEL_STATUS.ACTIVE,
        AppConstant.CHANNEL_STATUS.BLOCKED,
      ],
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    },
    category: {},
    subCategory: {},
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
  },

  { timestamps: true }
);
const Channel = mongoose.model("Channel", channelSchema);

module.exports = Channel;
