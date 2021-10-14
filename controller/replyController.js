const Reply = require("../model/Reply");
const Comment = require("../model/Comment");
const User = require("../model/User");
const AppConstant = require("../config/appConstants");
const { validationResult } = require("express-validator");
const exportIdGenerator = require("../config/IDGenerator");
const Notification = require("../model/Notification");

exports.createReply = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    const data = {
      article: comment.article,
      comment: req.params.id,
      avatar: req.user.avatar,
      name: req.user.name,
      user: req.user._id,
      reply: req.body.reply,
      userName: req.user.userName,
    };
    const reply = await new Reply(data);
    reply.replyId = exportIdGenerator(25);
    await reply.save();
    comment.reply.push(reply._id);
    await comment.save();
    //notification
    const notification = new Notification({
      receiveUser: comment.user,
      type: "reply",
      message: `${req.user.name} replied on your comment ${reply.reply}`,
    });
    notification.who.push({
      user: req.user._id,
      avatar: req.user.avatar,
      name: req.user.name,
    });
    notification.what.push(reply);
    await notification.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.editCommentReply = async (req, res) => {
  try {
    const reply = await Reply.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: AppConstant.REPLY_STATUS.ACTIVE,
    });
    reply.reply = req.body.reply;
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.deleteReply = async (req, res) => {
  try {
    const reply = await Reply.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    reply.status = AppConstant.REPLY_STATUS.BLOCKED;
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send();
  }
};
exports.getCommentReply = async (req, res) => {
  try {
    const comment = await Reply.find({
      comment: req.params.id,
      status: AppConstant.REPLY_STATUS.ACTIVE,
    })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-email" });
    res.send(comment);
  } catch (error) {
    res.status;
  }
};
exports.violationReply = async (req, res) => {
  try {
    const reply = await Reply.findOne({ _id: req.params.id });
    reply.violation.push({ user: req.user_id, reason: req.body.reason });
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.likeReply = async (req, res) => {
  try {
    const reply = await Reply.findOne({
      _id: req.params.id,
    });
    if (
      reply.likes.filter(
        (like) => like.user.toString() === req.user._id.toString()
      ).length > 0
    ) {
      return res.status(404).send("You have already liked this reply");
    }
    reply.likes.unshift({ user: req.user._id });
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.unlikeReply = async (req, res) => {
  try {
    const reply = await Reply.findOne({
      _id: req.params.id,
    });
    if (
      reply.likes.filter(
        (like) => like.user.toString() === req.user._id.toString()
      ).length === 0
    ) {
      return res.status(404).send("You have not liked this reply");
    }
    const index = reply.likes.findIndex(
      (like) => like.user.toString() === req.user._id.toString()
    );
    reply.likes.splice(index, 1);
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.blockReply = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.user._id });
    const adminRole = admin.roles.map(
      (role) => role === AppConstant.USER_ROLE.ADMIN
    );
    if (!adminRole) {
      return res.status(400).json({
        errors: [{ msg: "You are not eligible" }],
      });
    }
    const reply = await Reply.findOne({ _id: req.params.id });
    reply.status = AppConstant.REPLY_STATUS.BLOCKED;
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.unBlockReply = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.user._id });
    const adminRole = admin.roles.map(
      (role) => role === AppConstant.USER_ROLE.ADMIN
    );
    if (!adminRole) {
      return res.status(400).json({
        errors: [{ msg: "You are not eligible" }],
      });
    }
    const reply = await Reply.findOne({ _id: req.params.id });
    reply.status = AppConstant.REPLY_STATUS.ACTIVE;
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.deleteReply = async (req, res) => {
  try {
    const reply = await Reply.findOne({
      user: req.user._id,
      _id: req.params.id,
    });
    reply.status = AppConstant.REPLY_STATUS.BLOCKED;
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};
