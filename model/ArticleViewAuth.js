const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleViewAuthSchema = new Schema(
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

const ArticleViewAuth = mongoose.model(
  "ArticleViewAuth",
  articleViewAuthSchema
);
module.exports = ArticleViewAuth;
