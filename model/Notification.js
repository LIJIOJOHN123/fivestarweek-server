const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AppConstant = require("../config/appConstants");

const notificationSchema = new Schema(
  {
    receiveUser: {
      type: mongoose.Schema.Types.ObjectId,
      Ref: "User",
    },
    who: [],
    what: [],
    type: {
      type: String,
    },
    id: {
      type: String,
    },
    message: {
      type: String,
    },
    readStatus: {
      type: Number,
      default: AppConstant.NOTFICATION.UNREAD,
      enum: [AppConstant.NOTFICATION.UNREAD, AppConstant.NOTFICATION.READ],
    },
  },

  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
