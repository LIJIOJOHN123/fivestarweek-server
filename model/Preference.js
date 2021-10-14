const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const preferenceSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Number,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
    gender: {
      type: String,
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    keyword: [
      {
        keyword: {
          type: String,
        },
        active: {
          type: Boolean,
          default: true,
        },
        occurance: {
          type: Number,
          default: 1,
        },
      },
    ],
    intersted: [],
    visited: [
      {
        articles: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      },
    ],
  },

  { timestamps: true }
);
const Preference = mongoose.model("Preference", preferenceSchema);

module.exports = Preference;
