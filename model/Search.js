const mongoose = require("mongoose");
const AppConstant = require("../config/appConstants");
const Schema = mongoose.Schema;

const searchSchema = new Schema(
  {
    keyword: {
      type: String,
    },
    visit: [
      {
        user: {
          type: String,
        },
      },
    ],
    status: {
      type: Number,
      default: AppConstant.SEARCH_STATUS.NORMAL,
      enum: [
        AppConstant.SEARCH_STATUS.NORMAL,
        AppConstant.SEARCH_STATUS.POPULAR,
        AppConstant.SEARCH_STATUS.WASTE,
      ],
    },
  },

  { timestamps: true }
);
const Search = mongoose.model("Search", searchSchema);

module.exports = Search;
