const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bankDetails: [
      {
        bankName: { type: String },
        accountNumber: { type: String },
        IFSC: { type: String },
      },
    ],
    UPI: { type: String },
    payPal: { type: String },
    mobileApp: { type: String },
    profileId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
