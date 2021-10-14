const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleViewIPSchema = new Schema(
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

const ArticleViewIP = mongoose.model("ArticleViewIP", articleViewIPSchema);
module.exports = ArticleViewIP;
