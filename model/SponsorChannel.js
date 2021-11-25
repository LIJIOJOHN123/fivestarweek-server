const mongoose = require("mongoose");
const AppConstant = require("../config/appConstants");
const Schema = mongoose.Schema;

const channelSponsorSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    redirect: {
      type: String,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    askedViews: {
      type: Number,
    },
    estimate: {
      type: Number,
    },
    status: {
      type: Number,
      default: AppConstant.SPONSOR.REQUEST_PENDING,
      enum: [
        AppConstant.SPONSOR.NORMAL,
        AppConstant.SPONSOR.REQUEST_PENDING,
        AppConstant.SPONSOR.SPONSORED,
        AppConstant.SPONSOR.REJECTED,
        AppConstant.SPONSOR.BLOCK,
        AppConstant.SPONSOR.COMPLETED,
      ],
    },
    gender: {
      type: String,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    ageFrom: {
      type: Number,
    },
    ageTo: {
      type: Number,
    },

    authViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChannelViewAuth",
      },
    ],
    guestViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChannelViewIP",
      },
    ],
    guestVisit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChannelVisitAuth",
      },
    ],
    authVisit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChannelVisitIP",
      },
    ],
  },

  { timestamps: true }
);
const ChannelSponsor = mongoose.model("ChannelSponsor", channelSponsorSchema);

module.exports = ChannelSponsor;
