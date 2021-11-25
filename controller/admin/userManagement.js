const AppConstant = require("../../config/appConstants");
const User = require("../../model/User");
const Reply = require("../../model/Reply");
const Comment = require("../../model/Comment");
const Article = require("../../model/Article");
const Channel = require("../../model/Channel");
const AcitivityHistory = require("../../model/ActivityHistory");
const Preference = require("../../model/Preference");

/**************************** Users ****************************************/
//name:Get Users
//desc: get all users

exports.user_list = async (req, res) => {
  try {
    const usersCount = await User.find().countDocuments();
    const users = await User.find()
      .select(["-avatars", "", "-v", "-slug"])
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });
    res.send({ users, usersCount });
  } catch (error) {
    res.status(500).error;
  }
};

//name:Block user
//desc: block user
exports.user_block = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    const channels = await Channel.find({ user: req.params.id });
    const articles = await Article.find({ user: req.params.id });
    const comments = await Comment.find({ user: req.params.id });
    const replys = await Reply.find({ user: req.params.id });
    user.status = AppConstant.USER_STATUS.BLOCKED;
    channels.map((channel) => {
      channel.status = AppConstant.CHANNEL_STATUS.BLOCKED;
      return channel.save();
    });
    articles.map((article) => {
      article.status = AppConstant.ARTICLE_STATUS.BLOCKED;
      return article.save();
    });
    comments.map((comment) => {
      comment.status = AppConstant.COMMENT_STATUS.BLOCKED;
      return comment.save();
    });
    replys.map((reply) => {
      reply.status = AppConstant.REPLY_STATUS.BLOCKED;
      return reply.save();
    });
    await user.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} blocked this user.`,
      user: req.user._id,
      approved: req.user._id,
      type: "user_managment",
    });
    await activity.save();
    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
};

//name:Unblock user
//desc: unblock user

exports.user_unblock = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    const channels = await Channel.find({ user: req.params.id });
    const articles = await Article.find({ user: req.params.id });
    const comments = await Comment.find({ user: req.params.id });
    const replys = await Reply.find({ user: req.params.id });
    channels.map((channel) => {
      channel.status = AppConstant.CHANNEL_STATUS.ACTIVE;
      return channel.save();
    });
    articles.map((article) => {
      article.status = AppConstant.ARTICLE_STATUS.ACTIVE;
      return article.save();
    });
    comments.map((comment) => {
      comment.status = AppConstant.COMMENT_STATUS.ACTIVE;
      return comment.save();
    });
    replys.map((reply) => {
      reply.status = AppConstant.REPLY_STATUS.ACTIVE;
      return reply.save();
    });
    user.status = AppConstant.USER_STATUS.ACTIVE;
    await user.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} unblocked this user.`,
      user: req.user._id,
      approved: req.user._id,
      type: "user_managment",
    });
    await activity.save();
    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
};

exports.user_search = async (req, res) => {
  let search = req.query.key;
  try {
    // article
    let users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ],
    });
    res.send({ users });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.user_info_add = async (req, res) => {
  try {
    const prefer = await Preference.findOne({ user: req.params.id });
    prefer.state = req.body.state;
    prefer.country = req.body.country;
    prefer.date = req.body.date;
    prefer.month = req.body.month;
    prefer.year = req.body.year;
    prefer.gender = req.body.gender;
    await prefer.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} updated user qualification details(age,state,country).`,
      user: req.user._id,
      approved: req.user._id,
      type: "user_managment",
    });
    await activity.save();
    res.send(prefer);
  } catch (error) {
    res.status(500).send(error);
  }
};
