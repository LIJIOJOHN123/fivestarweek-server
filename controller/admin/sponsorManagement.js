const AppConstant = require("../../config/appConstants");
const AcitivityHistory = require("../../model/ActivityHistory");
const Article = require("../../model/Article");
const Channel = require("../../model/Channel");
const ArticleSponsor = require("../../model/SponsorArticle");
const ChannelSponsor = require("../../model/SponsorChannel");

//article sponsore list
exports.sponsor_pending_list = async (req, res) => {
  try {
    const sponsorArticle = await ArticleSponsor.find({
      status: AppConstant.SPONSOR.REQUEST_PENDING,
    }).sort({
      createdAt: -1,
    });
    const sponsorChannel = await ChannelSponsor.find({
      status: AppConstant.SPONSOR.REQUEST_PENDING,
    }).sort({
      createdAt: -1,
    });

    res.send({ sponsorChannel, sponsorArticle });
  } catch (error) {
    res.status(500).send(error);
  }
};

//approve
exports.sponsor_approve_article = async (req, res) => {
  try {
    const sponsorArticle = await ArticleSponsor.findOne({
      _id: req.params.id,
    });

    const article = await Article.findOne({ _id: sponsorArticle.articleId });
    sponsorArticle.status = AppConstant.SPONSOR.SPONSORED;
    article.sponsor = AppConstant.SPONSOR.SPONSORED;
    await sponsorArticle.save();
    await article.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} approved this sponsor article.`,
      user: req.user._id,
      approved: req.user._id,
      type: "sponsor management",
    });
    await activity.save();
    res.send({ sponsorArticle });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.sponsor_approve_channel = async (req, res) => {
  try {
    const sponsorChannel = await ChannelSponsor.findOne({
      _id: req.params.id,
    });
    const channel = await Channel.findOne({ _id: sponsorChannel.channelId });
    sponsorChannel.status = AppConstant.SPONSOR.SPONSORED;
    channel.sponsor = AppConstant.SPONSOR.SPONSORED;
    await sponsorChannel.save();
    await channel.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} approved this sponsor channel.`,
      user: req.user._id,
      approved: req.user._id,
      type: "sponsor management",
    });
    await activity.save();
    res.send({ sponsorChannel });
  } catch (error) {
    res.status(500).send(error);
  }
};
//reject
//approve
exports.sponsor_reject_article = async (req, res) => {
  try {
    const sponsorArticle = await ArticleSponsor.findOne({
      _id: req.params.id,
    });
    const article = await Article.findOne({ _id: sponsorArticle.articleId });
    sponsorArticle.status = AppConstant.SPONSOR.NORMAL;
    article.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsorArticle.save();
    await article.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} rejected this sponsor article.`,
      user: req.user._id,
      approved: req.user._id,
      type: "sponsor management",
    });
    await activity.save();
    res.send({ sponsorArticle });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.sponsor_reject_channel = async (req, res) => {
  try {
    const sponsorChannel = await ChannelSponsor.findOne({
      _id: req.params.id,
    });
    const channel = await Channel.findOne({ _id: sponsorChannel.channelId });
    sponsorChannel.status = AppConstant.SPONSOR.NORMAL;
    channel.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsorChannel.save();
    await channel.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} rejected this sponsor channel.`,
      user: req.user._id,
      approved: req.user._id,
      type: "sponsor management",
    });
    await activity.save();
    res.send({ sponsorChannel });
  } catch (error) {
    res.status(500).send(error);
  }
};
//approved list
exports.sponsor_article_list = async (req, res) => {
  try {
    const sponsorArticle = await ArticleSponsor.find({
      status: AppConstant.SPONSOR.SPONSORED,
    })
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });

    res.send({ sponsorArticle });
  } catch (error) {
    res.status(500).send(error);
  }
};
//approved list
exports.sponsor_channel_list = async (req, res) => {
  try {
    const sponsorChannel = await ChannelSponsor.find({
      status: AppConstant.SPONSOR.SPONSORED,
    })
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });

    res.send({ sponsorChannel });
  } catch (error) {
    res.status(500).send(error);
  }
};

//edit sposnore
exports.sponsor_channel_edit = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "askedViews",
    "estimate",
    "country",
    "state",

    "gender",
    "status",
    "ageFrom",
    "ageTo",
    "language",
  ];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send({ message: "Invalid udpate" });
  }
  try {
    const sponsor = await ChannelSponsor.findOne({ _id: req.params.id });
    updates.map((update) => (sponsor[update] = req.body[update]));
    await sponsor.save();
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.sponsor_article_edit = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "redirect",
    "askedViews",
    "estimate",
    "country",
    "state",

    "gender",
    "status",
    "ageFrom",
    "ageTo",
    "language",
  ];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send({ message: "Invalid udpate" });
  }
  try {
    const sponsor = await ArticleSponsor.findOne({ _id: req.params.id });
    updates.map((update) => (sponsor[update] = req.body[update]));
    await sponsor.save();
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};
//sponsre by id

exports.sponsor_channel_by_id = async (req, res) => {
  try {
    const channelSponsore = await ChannelSponsor.findOne({
      _id: req.params.id,
    });
    const channel = await Channel.findOne({ _id: channelSponsore.channelId });
    //viewauth
    const viewIp = await ChannelViewIP.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(channelSponsore.createdAt),
          },
          channel: mongoose.Types.ObjectId(channelSponsore.channelId),
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": -1 },
      },
      {
        $limit: 30,
      },
    ]);
    const viewsauth = await ChannelViewAuth.find({
      channel: channelSponsore.channelId,
    }).countDocuments();
    //view  ip
    const viewIps = await ChannelViewIP.find({
      channel: channelSponsore.channelId,
    }).countDocuments();
    //visit
    const visitAuth = await ChannelVisitAuth.find({
      channel: channelSponsore.channelId,
    }).countDocuments();
    //visit auth
    const visitIp = await ChannelVisitIP.find({
      channel: channelSponsore.channelId,
    }).countDocuments();
    res.send({
      viewsauth,
      viewIp,
      visitAuth,
      visitIp,
      viewsauth,
      viewIps,
      visitAuth,
      visitIp,
      channel,
      channelSponsore,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
//sponsre by id

exports.sponsor_article_by_id = async (req, res) => {
  try {
    const articleSponsore = await ArticleSponsor.findOne({
      _id: req.params.id,
    });
    const article = await Article.findOne({
      _id: articleSponsore.articleId,
    });
    //view  ip

    const viewIp = await ArticleViewIP.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(articleSponsore.createdAt),
          },
          article: mongoose.Types.ObjectId(articleSponsore.articleId),
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": -1 },
      },
      {
        $limit: 30,
      },
    ]);
    const viewsauth = await ArticleViewAuth.find({
      article: articleSponsore.articleId,
    }).countDocuments();
    //view  ip
    const viewIps = await ArticleViewIP.find({
      article: articleSponsore.articleId,
    }).countDocuments();
    //visit
    const visitAuth = await ArticleVisitAuth.find({
      article: articleSponsore.articleId,
    }).countDocuments();
    //visit auth
    const visitIp = await ArticleVisitIP.find({
      article: articleSponsore.articleId,
    }).countDocuments();

    res.send({
      articleSponsore,
      article,
      viewIp,
      viewsauth,
      viewIps,
      visitAuth,
      visitIp,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

//forced exit article sponsore
exports.sponsor_forced_article_exit = async (req, res) => {
  const sponsor = await ArticleSponsor.findOne({
    _id: req.params.id,
  });

  try {
    const article = await Article.findOne({
      _id: sponsor.articleId,
    });
    sponsor.status = AppConstant.SPONSOR.COMPLETED;
    article.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsor.save();
    await article.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} initiated forced exit.`,
      user: req.user._id,
      approved: req.user._id,
      type: "sponsor management",
    });
    await activity.save();
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};

//force exit channel sponsore
exports.sponsor_forced_channel_exit = async (req, res) => {
  const sponsor = await ChannelSponsor.findOne({ _id: req.params.id });
  try {
    const channel = await Channel.findOne({
      _id: sponsor.channelId,
    });
    sponsor.status = AppConstant.SPONSOR.COMPLETED;
    channel.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsor.save();
    await channel.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} initiated forced exit.`,
      user: req.user._id,
      approved: req.user._id,
      type: "sponsor management",
    });
    await activity.save();
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};
