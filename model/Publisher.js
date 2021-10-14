const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AppConstant = require("../config/appConstants");

const publisherSchema = new Schema(
  {
    publisher: {
      type: String,
      default: "Moneys",
    },
    publisherName: {
      type: String,
      default: "King",
    },
    publisherId: {
      type: String,
    },

    iconImage: {
      type: String,
      default: process.env.PUBLISHER_IMAGE,
    },
    articleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
    status: {
      type: Number,
      default: AppConstant.PUBLISHER_STATUS.NORMAL,
      enum: [
        AppConstant.PUBLISHER_STATUS.HOME,
        AppConstant.PUBLISHER_STATUS.BLOCKED,
        AppConstant.PUBLISHER_STATUS.NORMAL,
      ],
    },
  },
  { timestamps: true }
);
const Publisher = mongoose.model("Publisher", publisherSchema);

module.exports = Publisher;
