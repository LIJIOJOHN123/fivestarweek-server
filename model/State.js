const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stateSchema = new Schema(
  {
    state: {
      type: String,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
  },

  { timestamps: true }
);

const State = mongoose.model("State", stateSchema);
module.exports = State;
