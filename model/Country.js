const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countrySchema = new Schema(
  {
    code: {
      type: String,
    },
    country: {
      type: String,
    },
    phoneCode: {
      type: String,
    },
  },

  { timestamps: true }
);

const Country = mongoose.model("Country", countrySchema);
module.exports = Country;
