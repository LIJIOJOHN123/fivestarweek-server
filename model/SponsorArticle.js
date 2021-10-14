const mongoose = require("mongoose");
const AppConstant = require("../config/appConstants");
const Schema = mongoose.Schema;

const articleSponsorSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    ageFrom: {
      type: Number,
    },
    ageTo: {
      type: Number,
    },
    redirect: {
      type: String,
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
    authViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArticleViewAuth",
      },
    ],
    guestViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArticleViewIP",
      },
    ],
    guestVisit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArticleVisitAuth",
      },
    ],
    authVisit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArticleVisitIP",
      },
    ],
  },

  { timestamps: true }
);
const ArticleSponsor = mongoose.model("ArticleSponsor", articleSponsorSchema);

module.exports = ArticleSponsor;
