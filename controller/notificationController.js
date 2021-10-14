const AppConstant = require("../config/appConstants");
const Notification = require("../model/Notification");
exports.getNotification = async (req, res) => {
  try {
    const notificationCount = await Notification.find({
      receiveUser: req.user._id,
    }).countDocuments();
    const notificationUnread = await Notification.find({
      receiveUser: req.user._id,
      readStatus: AppConstant.NOTFICATION.UNREAD,
    }).countDocuments();

    const notifications = await Notification.find({ receiveUser: req.user._id })
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });
    res.send({ notifications, notificationCount, notificationUnread });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.notificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id });
    notification.readStatus = AppConstant.NOTFICATION.READ;
    notification.save();
    res.send(notification);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.notificationAllRead = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiveUser: req.user._id,
    });
    notifications.map(async (item) => {
      item.readStatus = AppConstant.NOTFICATION.READ;
      await item.save();
    });
    res.send(notifications);
  } catch (error) {
    res.status(500).send(error);
  }
};
