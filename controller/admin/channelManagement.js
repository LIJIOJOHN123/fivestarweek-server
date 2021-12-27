const AppConstant = require("../../config/appConstants");
const AcitivityHistory = require("../../model/ActivityHistory");
const Article = require("../../model/Article");
const Channel = require("../../model/Channel");
const Language = require("../../model/Language");

//channel List
// channel List count
exports.channel_list = async (req, res) => {
  try {
    const channels = await Channel.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    const channelCount = await Channel.find().countDocuments();
    res.send({ channels, channelCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Block Channel
//desc: block one chanel
exports.channel_block = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    const articles = await Article.find({ channel: req.params.id });
    articles.map((article) => {
      article.status = AppConstant.ARTICLE_STATUS.BLOCKED;
      return article.save();
    });

    channel.status = AppConstant.CHANNEL_STATUS.BLOCKED;
    const activity = new AcitivityHistory({
      action: `${req.user.name} blocked this channel.`,
      user: req.user._id,
      approved: req.user._id,
      type: "channel_management",
    });
    await activity.save();
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unblock Channel
//desc:unblock block channel
exports.channel_unblock = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    const articles = await Article.find({ channel: req.params.id });
    articles.map((article) => {
      article.status = AppConstant.ARTICLE_STATUS.ACTIVE;
      return article.save();
    });
    channel.status = AppConstant.CHANNEL_STATUS.ACTIVE;
    const activity = new AcitivityHistory({
      action: `${req.user.name} unblocked this channel.`,
      user: req.user._id,
      approved: req.user._id,
      type: "channel_management",
    });
    await activity.save();
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name: channel verification
//desc:channel verirify

exports.channel_add_verification = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    channel.verifiedStatus = AppConstant.CHANNEL_VERIFICATION.VERIFIED;
    const activity = new AcitivityHistory({
      action: `${req.user.name} marked as verfied channel.`,
      user: req.user._id,
      approved: req.user._id,
      type: "channel_management",
    });
    await activity.save();
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};
//name: channel verification
//desc:remove verification

exports.channel_remove_vefication = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    channel.verifiedStatus = AppConstant.CHANNEL_VERIFICATION.NORMAL;
    const activity = new AcitivityHistory({
      action: `${req.user.name} removed channle verification.`,
      user: req.user._id,
      approved: req.user._id,
      type: "channel_management",
    });
    await activity.save();
    await channel.save();
    res.send(channel);
  } catch (error) {}
};

//name:add channel
//desc: add channel to langauge

exports.addChannelToLanguage = async (req, res) => {
  try {
    const language = await Language.findOne({ _id: req.params.id });
    language.channels.unshift(req.params.cid);

    await language.save();
    res.send(language);
  } catch (error) {
    res.status(500).send(error);
  }
};

//channel search
exports.channel_search = async (req, res) => {
  let search = req.query.key;
  try {
    let channels = await Channel.find({
      $or: [
        { channel: { $regex: search, $options: "i" } },
        { channelName: { $regex: search, $options: "i" } },
        { introduction: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.send({ channels });
  } catch (error) {
    res.status(500).send(error);
  }
};
//channel  add language,city, state
exports.channel_add_additional_info = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
    });
    channel.language = req.body.language;
    channel.home = req.body.home;
    const activity = new AcitivityHistory({
      action: `${req.user.name} added language to this channel.`,
      user: req.user._id,
      approved: req.user._id,
      type: "channel_management",
    });
    await activity.save();
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};
