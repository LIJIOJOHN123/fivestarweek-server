const mongoose = require("mongoose");
const AppConstant = require("../config/appConstants");
const Schema = mongoose.Schema;
const replySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    reply: {
      type: String,
    },
    replyId: {
      type: "String",
    },

    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
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
    status: {
      type: Number,
      default: AppConstant.REPLY_STATUS.ACTIVE,
      enum: [AppConstant.REPLY_STATUS.ACTIVE, AppConstant.REPLY_STATUS.BLOCKED],
    },
  },
  { timestamps: true }
);
const Reply = mongoose.model("Reply", replySchema);
module.exports = Reply;
