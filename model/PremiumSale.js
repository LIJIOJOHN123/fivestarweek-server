const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AppConstant = require("../config/appConstants");

const PremiumSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      Ref: "User",
    },
    refer: {
      type: String,
    },
    referUser: {
      type: mongoose.Schema.Types.ObjectId,
      Ref: "User",
    },
    amount: {
      type: Number,
    },
    date: {
      type: String,
    },
    registeredStatus: {
      type: Boolean,
      default: false,
    },
    premiumId: {
      type: String,
    },
    oldPremiumType: {
      type: Number,
      default: AppConstant.PREMIUM_TYPE.NORMAL,
      enum: [
        AppConstant.PREMIUM_TYPE.NORMAL,
        AppConstant.PREMIUM_TYPE.SILVER,
        AppConstant.PREMIUM_TYPE.GOLD,
        AppConstant.PREMIUM_TYPE.DIAMOND,
      ],
    },
    pointStatus: {
      type: Boolean,
      default: false,
    },
    premiumType: {
      type: Number,
      default: AppConstant.PREMIUM_TYPE.NORMAL,
      enum: [
        AppConstant.PREMIUM_TYPE.NORMAL,
        AppConstant.PREMIUM_TYPE.SILVER,
        AppConstant.PREMIUM_TYPE.GOLD,
        AppConstant.PREMIUM_TYPE.DIAMOND,
      ],
    },
    commissionAmount: {
      type: Number,
    },
    type: {
      type: Number,
      default: AppConstant.PREMIUM_USER_TYPE.NEW,
      enum: [
        AppConstant.PREMIUM_USER_TYPE.NEW,
        AppConstant.PREMIUM_USER_TYPE.UPGRADE,
      ],
    },
    status: {
      default: AppConstant.PREMIUM_SELLER.NOT_PAID,
      enum: [
        AppConstant.PREMIUM_SELLER.NOT_PAID,
        AppConstant.PREMIUM_SELLER.PENDING,
        AppConstant.PREMIUM_SELLER.APPROVED,
        AppConstant.PREMIUM_SELLER.PAID,
      ],
    },
  },

  { timestamps: true }
);
const Premium = mongoose.model("Premium", PremiumSchema);

module.exports = Premium;
