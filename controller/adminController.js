const AppConstant = require("../config/appConstants");
const User = require("../model/User");
const Reply = require("../model/Reply");
const Comment = require("../model/Comment");
const Article = require("../model/Article");
const Channel = require("../model/Channel");
const Publisher = require("../model/Publisher");
const Payment = require("../model/Payment");
const Language = require("../model/Language");
const Earning = require("../model/Earning");
const Score = require("../model/Score");
const ArticleSponsor = require("../model/SponsorArticle");
const ChannelSponsor = require("../model/SponsorChannel");
const Survey = require("../model/Survey");
/**************************** Users ****************************************/
//name:Create admin
//desc: create admin user

exports.createAdmin = async (req, res) => {
  try {
    const userOne = await User.findOne({ email: req.body.email });
    const token = await userOne.generateToken();
    userOne.isAd = true;
    userOne.roles.push(AppConstant.USER_ROLE.ADMIN);
    await userOne.save();
    res.send({ userOne, token });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Block user
//desc: block user
exports.blockUser = async (req, res) => {
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

    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
};

//name:Unblock user
//desc: unblock user

exports.unblockUser = async (req, res) => {
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
    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
};

//name:Get Users
//desc: get all users

exports.getAllUsers = async (req, res) => {
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

/**************************** Channels ****************************************/

//channel List
// channel List count
exports.channelList = async (req, res) => {
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
exports.blockChannels = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    const articles = await Article.find({ channel: req.params.id });
    articles.map((article) => {
      article.status = AppConstant.ARTICLE_STATUS.BLOCKED;
      return article.save();
    });

    channel.status = AppConstant.CHANNEL_STATUS.BLOCKED;
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unblock Channel
//desc:unblock block channel
exports.unBlockChannels = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    const articles = await Article.find({ channel: req.params.id });
    articles.map((article) => {
      article.status = AppConstant.ARTICLE_STATUS.ACTIVE;
      return article.save();
    });
    channel.status = AppConstant.CHANNEL_STATUS.ACTIVE;
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name: channel verification
//desc:channel verirify

exports.addVerfication = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    channel.verifiedStatus = AppConstant.CHANNEL_VERIFICATION.VERIFIED;
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};
//name: channel verification
//desc:remove verification

exports.removeVerification = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    channel.verifiedStatus = AppConstant.CHANNEL_VERIFICATION.NORMAL;
    await channel.save();
    res.send(channel);
  } catch (error) {}
};

/**************************** Articles ****************************************/

//Article List
//get all articles and posts

exports.articleList = async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    const articlesCount = await Article.find().countDocuments();
    res.send({ articles, articlesCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Block article
//desc: block article
exports.blockArticles = async (req, res) => {
  try {
    const article = await Article.findOne({ _id: req.params.id });
    const linkArticle = await Article.find({ link: article.link });
    linkArticle.map((single) => {
      single.status = AppConstant.ARTICLE_STATUS.BLOCKED;
      single.save();
      return single;
    });
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unblock article
//desc: unblock article
exports.unBlockArticles = async (req, res) => {
  try {
    const article = await Article.findOne({ _id: req.params.id });
    const linkArticle = await Article.find({ link: article.link });
    linkArticle.map((single) => {
      single.status = AppConstant.ARTICLE_STATUS.ACTIVE;
      return single.save();
    });
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:get Violated article
//desc: get violated aritcles
exports.getViolatedArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    const reason = articles.filter((item) => {
      if (item.violation.length > 0) {
        return item;
      }
    });
    res.send(reason);
  } catch (error) {}
};
/**************************** Comments ****************************************/

//name:get Violated comments
//desc: get violated comments
exports.getViolatedComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    const reason = comments.filter((item) => {
      if (item.violation.length > 0) {
        return item;
      }
    });
    res.send(reason);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:  comment list
//desc: list of comments
exports.commentList = async (req, res) => {
  try {
    const commentCount = await Comment.find().countDocuments();
    const comments = await Comment.find()
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });
    res.send({ comments, commentCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:  comment list
//desc: list of comments

exports.replyList = async (req, res) => {
  try {
    const replyCount = await Reply.find().countDocuments();
    const replies = await Reply.find()
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });
    res.send({ replies, replyCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Block  comment
//desc: block comment
exports.blockComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    comment.status = AppConstant.COMMENT_STATUS.BLOCKED;
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unblock  comment
//desc: unblock comment

exports.unBlockComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    comment.status = AppConstant.COMMENT_STATUS.ACTIVE;
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

/**************************** Reply ****************************************/

//name:Block  reply
//desc: block reply
exports.blockReply = async (req, res) => {
  try {
    const reply = await Reply.findOne({ _id: req.params.id });
    reply.status = AppConstant.REPLY_STATUS.BLOCKED;
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unblock  reply
//desc: unblock reply

exports.unBlockReply = async (req, res) => {
  try {
    const reply = await Reply.findOne({ _id: req.params.id });
    reply.status = AppConstant.REPLY_STATUS.ACTIVE;
    await reply.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getViolatedReply = async (req, res) => {
  try {
    const reply = await Reply.find();
    const reason = reply.filter((item) => {
      if (item.violation.length > 0) {
        return item;
      }
    });
    res.send(reason);
  } catch (error) {
    res.status(500).send(error);
  }
};
/**************************** Publisher ****************************************/

//Publisher Status Change
//publisher approve from admin
exports.publisherApprove = async (req, res) => {
  try {
    const publisher = await Publisher.findById({ _id: req.params.id });
    publisher.status = AppConstant.SOURCE_STATUS.HOME;
    publisher.iconImage = req.body.iconImage;
    publisher.publisherName = req.body.publsherName;
    await publisher.save();
    res.send(publisher);
  } catch (error) {
    res.status(500).send(error);
  }
};
//Publisher List
// get all publshers
exports.publisherList = async (req, res) => {
  try {
    const publishers = await Publisher.find();
    const publisherCount = await Publisher.find().countDocuments();
    res.send({ publishers, publisherCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.addPayment = async (req, res) => {
  try {
    const payment = new Payment({
      description: req.body.description,
      type: "Credit",
      amount: req.body.amount,
      user: req.params.id,
    });
    const paymentIndex = await Payment.find({
      user: req.params.id,
    }).countDocuments();
    if (paymentIndex === 0) {
      payment.balance = req.body.amount;
      await payment.save();
    } else {
      const paymentAll = await Payment.find({ user: req.params.id });
      const paymentLast = paymentAll[paymentIndex - 1];
      payment.balance === 0
        ? (payment.balance = req.body.amount)
        : (payment.balance = paymentLast.balance + req.body.amount);
      await payment.save();
    }
    res.send(payment);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.removePayment = async (req, res) => {
  try {
    const payment = new Payment({
      description: req.body.description,
      type: "Debit",
      amount: req.body.amount,
      user: req.params.id,
    });
    const paymentIndex = await Payment.find({
      user: req.params.id,
    }).countDocuments();
    if (paymentIndex === 0) {
      payment.balance = req.body.amount;
      await payment.save();
    } else {
      const paymentAll = await Payment.find({ user: req.params.id });
      const paymentLast = paymentAll[paymentIndex - 1];
      payment.balance === 0
        ? (payment.balance = req.body.amount)
        : (payment.balance = paymentLast.balance - req.body.amount);
      await payment.save();
    }
    res.send(payment);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getAllPayment = async (req, res) => {
  try {
    const payment = await Payment.find({ user: req.params.id })
      .sort({
        createdAt: -1,
      })
      .limit(parseInt(req.query.limit));
    res.send({ payment });
  } catch (error) {}
};

/**************************** Langauge  ****************************************/

//name: create langauge
//desc: create langauge

exports.addLanguage = async (req, res) => {
  const newLanguage = {
    language: req.body.language,
    languageLoc: req.body.languageLoc,
  };
  try {
    const language = new Language(newLanguage);
    await language.save();
    res.send(language);
  } catch (error) {
    res.status(500).send(error);
  }
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

exports.addEarning = async (req, res) => {
  try {
    const earn = await Earning.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    if (earn) {
      let totals = parseInt(earn.balance) + parseInt(req.body.amount);
      const newpayment = {
        user: req.params.id,
        type: "Credit",
        description: req.body.description,
        amount: req.body.amount,
        status: true,
        balance: totals,
      };
      const earnings = new Earning(newpayment);
      await earnings.save();
      res.send(earnings);
    } else {
      const newpayments = {
        user: req.params.id,
        type: "Credit",
        description: req.body.description,
        amount: req.body.amount,
        status: true,
        balance: req.body.amount,
      };
      const earning = new Earning(newpayments);
      await earning.save();
      res.send(earning);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.removeEarning = async (req, res) => {
  try {
    const earn = await Earning.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    let totals = parseInt(earn.balance) - parseInt(req.body.amount);
    const newpayment = {
      user: req.body.user,
      type: "Debit",
      description: req.body.description,
      amount: req.body.amount,
      status: true,
      balance: totals,
    };
    const earning = new Earning(newpayment);
    await earning.save();
    res.send(earning);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.approveMarketingRequest = async (req, res) => {
  try {
    let score = await Score.findOne({ _id: req.params.id });
    const exist = await Score.findOne({
      user: score.user,
      activity: "Social Media Promotion",
    }).sort({ createdAt: -1 });
    if (exist) {
      await Score.deleteOne({ _id: req.params.id });
      return res
        .status(404)
        .send("Your has been deleted. We have paid already points");
    }
    const scorePrev = await Score.findOne({ user: score.user }).sort({
      createdAt: -1,
    });
    const userScore = new Score({
      user: score.user,
      activity: "Social Media Promotion",
      description: `shared promotion article in social media`,
      mode: "Credit",
      points: 500,
      totalScore: scorePrev.totalScore + 500,
    });
    await Score.deleteOne({ _id: req.params.id });
    await userScore.save();
    res.send(userScore);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.scorependinglist = async (req, res) => {
  try {
    const pendingList = await Score.find({
      user: req.user._id,
      request: false,
    });
    res.send({ pendingList });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.scoreList = async (req, res) => {
  try {
    const scoreList = await Score.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    res.send({ scoreList });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.addScore = async (req, res) => {
  try {
    const scorePrev = await Score.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    const userScore = new Score({
      user: req.params.id,
      activity: req.body.activity,
      description: req.body.description,
      mode: "Credit",
      points: req.body.points,
      totalScore: scorePrev.totalScore + req.body.points,
    });
    await userScore.save();
    res.send(userScore);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.removeScore = async (req, res) => {
  try {
    const scorePrev = await Score.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    const userScore = new Score({
      user: req.params.id,
      activity: req.body.activity,
      description: req.body.description,
      mode: "Debit",
      points: req.body.points,
      totalScore: scorePrev.totalScore - req.body.points,
    });
    await userScore.save();
    res.send(userScore);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.withdrawalList = async (req, res) => {
  try {
    const withdrawal = await Earning.find({ type: "Debit", status: true }).sort(
      { createdAt: -1 }
    );
    res.send({ withdrawal });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.withdrawalApprove = async (req, res) => {
  try {
    const withdrawal = await Earning.findOne({
      type: "Debit",
      status: true,
      _id: req.params.id,
    });
    withdrawal.status = false;
    await withdrawal.save();
    res.send({ withdrawal });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.earningList = async (req, res) => {
  try {
    const earningsList = await Earning.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    res.send({ earningsList });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.addChannelDetails = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id });
    (channel.language = req.body.language),
      (channel.country = req.body.country),
      (channel.state = req.body.state),
      (channel.city = req.body.city),
      (channel.keyword = req.body.keyword);
    channel.category = req.body.category;
    channel.subcategory = req.body.subcategory;
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};
//search
exports.userSearch = async (req, res) => {
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
//articlesearch
exports.articleSearch = async (req, res) => {
  let search = req.query.key;
  try {
    // article
    let articles = await Article.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.send({ articles });
  } catch (error) {
    res.status(500).send(error);
  }
};
//channel search
exports.channelSearch = async (req, res) => {
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

//comment search
exports.commentSearch = async (req, res) => {
  let search = req.query.key;
  try {
    let comments = await Comment.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.send({ comments });
  } catch (error) {
    res.status(500).send(error);
  }
};
//reply search
exports.replySearch = async (req, res) => {
  let search = req.query.key;
  try {
    let replies = await Reply.find({
      $or: [{ reply: { $regex: search, $options: "i" } }],
    }).sort({ createdAt: -1 });

    res.send({ replies });
  } catch (error) {
    res.status(500).send(error);
  }
};

//article sponsore list
exports.sponsorApprovePendingList = async (req, res) => {
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
exports.sponsorApproveArticle = async (req, res) => {
  try {
    const sponsorArticle = await ArticleSponsor.findOne({
      _id: req.params.id,
    });

    const article = await Article.findOne({ _id: sponsorArticle.articleId });
    sponsorArticle.status = AppConstant.SPONSOR.SPONSORED;
    article.sponsor = AppConstant.SPONSOR.SPONSORED;
    await sponsorArticle.save();
    await article.save();
    res.send({ sponsorArticle });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.sponsorApproveChannel = async (req, res) => {
  try {
    const sponsorChannel = await ChannelSponsor.findOne({
      _id: req.params.id,
    });
    const channel = await Channel.findOne({ _id: sponsorChannel.channelId });
    sponsorChannel.status = AppConstant.SPONSOR.SPONSORED;
    channel.sponsor = AppConstant.SPONSOR.SPONSORED;
    await sponsorChannel.save();
    await channel.save();
    res.send({ sponsorChannel });
  } catch (error) {
    res.status(500).send(error);
  }
};
//reject
//approve
exports.sponsorRejectArticle = async (req, res) => {
  try {
    const sponsorArticle = await ArticleSponsor.findOne({
      _id: req.params.id,
    });
    const article = await Article.findOne({ _id: sponsorArticle.articleId });
    sponsorArticle.status = AppConstant.SPONSOR.NORMAL;
    article.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsorArticle.save();
    await article.save();
    res.send({ sponsorArticle });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.sponsorRejectChannel = async (req, res) => {
  try {
    const sponsorChannel = await ChannelSponsor.findOne({
      _id: req.params.id,
    });
    const channel = await Channel.findOne({ _id: sponsorChannel.channelId });
    sponsorChannel.status = AppConstant.SPONSOR.NORMAL;
    channel.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsorChannel.save();
    await channel.save();
    res.send({ sponsorChannel });
  } catch (error) {
    res.status(500).send(error);
  }
};
//approved list
exports.sponsoredArticleList = async (req, res) => {
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
exports.sponsoredChannelList = async (req, res) => {
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
exports.editChannelSponsore = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "askedViews",
    "estimate",
    "country",
    "state",
    "city",
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
exports.editArticleSponsore = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "redirect",
    "askedViews",
    "estimate",
    "country",
    "state",
    "city",
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
//survey list
exports.surveyList = async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    res.send(surveys);
  } catch (error) {
    res.status(500).send(error);
  }
};

//approve
exports.surveyApprove = async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          status: AppConstant.SURVEY_STATUS.APPROVE,
        },
      }
    );
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//reject
exports.surveyReject = async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          status: AppConstant.SURVEY_STATUS.REJECT,
        },
      }
    );
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//sponsre by id

exports.sponsoreChannelByIdAdmin = async (req, res) => {
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

exports.sponsoreArticleByIdAdmin = async (req, res) => {
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

//approve all surveys

exports.surveyApproveAllAdmin = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
    });
    let runs = await survey.result.filter(
      (item) => item.resultStatus == AppConstant.SURVEY_ANSWER_STATUS.PENDING
    );
    runs.map(
      (item) => (item.resultStatus = AppConstant.SURVEY_ANSWER_STATUS.APPROVE)
    );

    await survey.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//forced exit survey
exports.forcefulExitAdminSurvey = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
    });
    survey.status = AppConstant.SURVEY_STATUS.COMPLETED;
    await survey.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//forced exit article sponsore
exports.forcedArticleSponsorExitAdmin = async (req, res) => {
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
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};

//force exit channel sponsore
exports.forcedChannelSponsorAdmin = async (req, res) => {
  const sponsor = await ChannelSponsor.findOne({ _id: req.params.id });
  try {
    const channel = await Channel.findOne({
      _id: sponsor.channelId,
    });
    sponsor.status = AppConstant.SPONSOR.COMPLETED;
    channel.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsor.save();
    await channel.save();
    res.send(sponsor);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

//channel  add language,city, state
exports.channelAddInfo = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
    });
    channel.language = req.body.language;
    channel.country = req.body.country;
    channel.state = req.body.state;
    channel.city = req.body.city;
    await channel.save();
    res.send(channel);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
