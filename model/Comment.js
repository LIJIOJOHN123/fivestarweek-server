const mongoose = require("mongoose");
const AppConstant = require("../config/appConstants");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    title: {
      type: String,
    },
    comment: { type: String },

    commentId: {
      type: "String",
    },
    reply: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply",
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
      type: String,
      default: AppConstant.COMMENT_STATUS.ACTIVE,
      enum: [
        AppConstant.COMMENT_STATUS.ACTIVE,
        AppConstant.COMMENT_STATUS.BLOCKED,
      ],
    },
  },
  { timestamps: true }
);
const Commet = mongoose.model("Comment", CommentSchema);
module.exports = Commet;
