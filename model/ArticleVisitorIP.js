const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleVisitIPSchema = new Schema(
  {
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

const ArticleVisitIP = mongoose.model("ArticleVisitIP", articleVisitIPSchema);
module.exports = ArticleVisitIP;
