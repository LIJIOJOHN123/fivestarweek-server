const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AppConstant = require("../config/appConstants");

const articleSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    slug: {
      type: String,
    },
    type: {
      type: String,
      default: "Article",
    },
    link: {
      type: String,
    },
    title: {
      type: String,
      default: "No title available",
    },
    description: {
      type: String,
    },
    articleId: {
      type: String,
    },
    publisherId: {
      type: String,
    },
    image: {
      type: String,
      default: process.env.ARTICLE_IMAGE,
    },
    keywords: [],
    source: {
      type: String,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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
        ref: "ArticleVisitIP",
      },
    ],
    visit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArticleVisitAuth",
      },
    ],
    viewIP: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArticleViewIP",
      },
    ],
    view: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArticleViewAuth",
      },
    ],
    violation: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          Ref: "User",
        },
        reason: {
          type: String,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    articleDetails: [],
    status: {
      type: Number,
      default: AppConstant.ARTICLE_STATUS.ACTIVE,
      enum: [
        AppConstant.ARTICLE_STATUS.ACTIVE,
        AppConstant.ARTICLE_STATUS.BLOCKED,
      ],
    },
  },
  { timestamps: true }
);
articleSchema.methods.toJSON = function () {
  const article = this;
  const articleObject = article.toObject();
  delete articleObject.articleDetails;

  return articleObject;
};
const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
