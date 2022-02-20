const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AppConstant = require("../config/appConstants");

const categorySchema = new Schema(
  {
    category: {
      type: String,
    },
    localCategory: {
      type: String,
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    channels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    status: {
      type: Number,
      default: AppConstant.CATEGORY.ACTIVE,
      enum: [AppConstant.CATEGORY.ACTIVE, AppConstant.CATEGORY.BLOCKED],
    },
  },

  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
