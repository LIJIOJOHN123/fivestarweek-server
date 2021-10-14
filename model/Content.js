const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conentScema = new Schema(
  {
    langauge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    videoEmbed: {
      type: String,
    },
  },

  { timestamps: true }
);

const City = mongoose.model("City", conentScema);
module.exports = City;
