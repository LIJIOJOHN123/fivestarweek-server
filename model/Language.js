const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const languageLanguage = new Schema(
  {
    language: {
      type: String,
    },
    languageLoc: {
      type: String,
    },
    channels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
  },
  { timestamps: true }
);
const Language = mongoose.model("Language", languageLanguage);

module.exports = Language;
