const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleVisitAuthSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
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

const ArticleVisitAuth = mongoose.model(
  "ArticleVisitAuth",
  articleVisitAuthSchema
);
module.exports = ArticleVisitAuth;
