const AppConstant = require("../config/appConstants");
const Comment = require("../model/Comment");
const Article = require("../model/Article");
const Channel = require("../model/Channel");
const Search = require("../model/Search");
const Preference = require("../model/Preference");

//name:Search result
//desc: filter search result
//status:@public

exports.search = async (req, res) => {
  let search = req.query.key;
  //article
  let limit = req.query.limit;
  //video
  let limits = req.query.limits;
  //channel
  let limited = req.query.limited;
  //comment
  let limiting = req.query.limiting;
  let searchkey = req.query.key.toLowerCase();

  if (req.user) {
    const pref = await Preference.findOne({ user: req.user._id });
    if (!pref) {
      const search = new Preference({ user: req.user._id });

      search.keyword.unshift({ keyword: searchkey });
      await search.save();
    }
    const keywords = await Preference.findOne({ "keyword.keyword": searchkey });
    if (keywords) {
      await keywords.keyword.map((key) =>
        key.keyword === searchkey ? (key.occurance = key.occurance + 1) : key
      );
      await keywords.save();
    } else {
      pref.keyword.unshift({ keyword: searchkey });
    }
    await pref.save();
  }

  let key = new Search({ keyword: searchkey });
  if (req.user) {
    key.visit.push({ user: req.user._id });
  }
  await key.save();

  try {
    // article
    let articlesCount = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    let article = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    })
      .populate(["channel", "user"])
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    // video

    let videosCount = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Video",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    let video = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Video",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    })
      .populate(["channel", "user"])
      .limit(parseInt(limits))
      .sort({ createdAt: -1 });
    // COMMENT
    let commentsCount = await Comment.find({
      status: AppConstant.COMMENT_STATUS.ACTIVE,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    let comment = await Comment.find({
      status: AppConstant.COMMENT_STATUS.ACTIVE,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ],
    })
      .populate(["user", "channel", "article"])
      .limit(parseInt(limiting))
      .sort({ createdAt: -1 });
    //channel
    let channelsCount = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
      $or: [
        { channel: { $regex: search, $options: "i" } },
        { channelName: { $regex: search, $options: "i" } },
        { introduction: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    let channel = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
      $or: [
        { channel: { $regex: search, $options: "i" } },
        { channelName: { $regex: search, $options: "i" } },
        { introduction: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ],
    })
      .populate("user")
      .limit(parseInt(limited))
      .sort({ createdAt: -1 });
    res.send({
      article,
      video,
      channel,
      comment,
      articlesCount,
      videosCount,
      channelsCount,
      commentsCount,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Pre search
//desc: filter pre-search result
//status:@public

exports.presearch = async (req, res) => {
  try {
    const channels = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
      verifiedStatus: AppConstant.CHANNEL_VERIFICATION.VERIFIED,
    })
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(18);
    let channeOnline = channels.map((item) => item._id);
    const articles = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
      channel: channeOnline,
    })
      .populate(["channel", "user"])
      .sort({ createdAt: 1 })
      .limit(20);
    const videos = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Video",
    })
      .populate(["channel", "user"])
      .sort({ createdAt: 1 })
      .limit(20);
    const comments = await Comment.find({
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    })
      .populate(["article", "user", "channel"])
      .sort({ createdAt: -1 })
      .limit(21);
    res.send({ articles, videos, channels, comments });
  } catch (error) {
    res.status(500).send(error);
  }
};
