const AppConstant = require("../config/appConstants");
const Article = require("../model/Article");
const ArticleViewAuth = require("../model/ArticleViewAuth");
const ArticleViewIP = require("../model/ArticleViewIP");
const ArticleVisitAuth = require("../model/ArticleVisitorAuth");
const ArticleVisitIP = require("../model/ArticleVisitorIP");
const Channel = require("../model/Channel");
const ChannelViewAuth = require("../model/ChannelViewAuth");
const ChannelViewIP = require("../model/ChannelViewIP");
const ChannelVisitAuth = require("../model/ChannelVisitorAuth");
const ChannelVisitIP = require("../model/ChannelVisitorIP");
const City = require("../model/City");
const Country = require("../model/Country");
const Payment = require("../model/Payment");
const ArticleSponsor = require("../model/SponsorArticle");
const ChannelSponsor = require("../model/SponsorChannel");
const State = require("../model/State");
var mongoose = require("mongoose");
const Language = require("../model/Language");
const Preference = require("../model/Preference");

exports.createArticleSponsor = async (req, res) => {
  const article = await Article.findOne({ _id: req.body.articleId });
  const authUser = article.user.toString() === req.user._id.toString();
  if (!authUser) {
    return res.status(404).send({ message: "You are not authorized" });
  }
  let countrySelect;
  if (req.body.country === "All") {
    let countryAlone = await Country.findOne({ country: "All" });
    countrySelect = countryAlone._id;
  } else {
    countrySelect = req.body.country;
  }
  let stateSelect;
  if (req.body.state === "All") {
    const stateAlone = await State.findOne({ state: "All" });
    stateSelect = stateAlone._id;
  } else {
    stateSelect = req.body.state;
  }
  let citySelect;
  if (req.body.city === "All") {
    const cityAlone = await City.findOne({ city: "All" });
    citySelect = cityAlone._id;
  } else {
    citySelect = req.body.city;
  }
  let languageSelect;
  if (req.body.language === "All") {
    const languageAlone = await Language.findOne({ language: "English" });
    languageSelect = languageAlone._id;
  } else {
    languageSelect = req.body.language;
  }
  try {
    const newSponsor = {
      user: req.user._id,
      articleId: req.body.articleId,
      redirect: req.body.redirect,
      askedViews: req.body.askedViews,
      gender: req.body.gender,
      country: countrySelect,
      state: stateSelect,
      language: languageSelect,
      city: citySelect,
      estimate: req.body.estimate,
      ageFrom: req.body.ageFrom,
      ageTo: req.body.ageTo,
      title: req.body.title,
      description: req.body.description,
    };
    const sponsor = new ArticleSponsor(newSponsor);
    const payList = await Payment.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const payment = new Payment({
      description: req.body.description,
      type: "Debit",
      amount: req.body.estimate,
      user: req.user._id,
    });
    if (payList.balance < 0) {
      return res
        .status(404)
        .send({ message: "You do nave enough balance in your account." });
    }
    payment.balance = payList.balance - req.body.estimate;
    sponsor.sponsor = AppConstant.SPONSOR.REQUEST_PENDING;
    article.sponsor = AppConstant.SPONSOR.REQUEST_PENDING;
    await article.save();
    await payment.save();
    await sponsor.save();
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.forcedArticleSponsorExit = async (req, res) => {
  const sponsor = await ArticleSponsor.findOne({
    _id: req.params._id,
    user: req.user._id,
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

exports.createChannelSponsor = async (req, res) => {
  const channel = await Channel.findOne({ _id: req.body.channelId });
  const authUser = channel.user.toString() === req.user._id.toString();
  if (!authUser) {
    return res.status(404).send({ message: "You are not authorized" });
  }
  let countrySelect;
  if (req.body.country === "All") {
    let countryAlone = await Country.findOne({ country: "All" });
    countrySelect = countryAlone._id;
  } else {
    countrySelect = req.body.country;
  }
  let stateSelect;
  if (req.body.state === "All") {
    const stateAlone = await State.findOne({ state: "All" });
    stateSelect = stateAlone._id;
  } else {
    stateSelect = req.body.state;
  }
  let citySelect;
  if (req.body.city === "All") {
    const cityAlone = await City.findOne({ city: "All" });
    citySelect = cityAlone._id;
  } else {
    citySelect = req.body.city;
  }
  let languageSelect;
  if (req.body.language === "All") {
    const languageAlone = await Language.findOne({ language: "English" });
    languageSelect = languageAlone._id;
  } else {
    languageSelect = req.body.language;
  }
  try {
    const newSponsor = {
      user: req.user._id,
      channelId: req.body.channelId,
      askedViews: req.body.askedViews,
      gender: req.body.gender,
      country: countrySelect,
      state: stateSelect,
      language: languageSelect,
      city: citySelect,
      estimate: req.body.estimate,
      ageFrom: req.body.ageFrom,
      ageTo: req.body.ageTo,
      title: req.body.title,
      description: req.body.description,
    };
    const sponsor = new ChannelSponsor(newSponsor);
    const payList = await Payment.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const payment = new Payment({
      description: "Debited amount for publishing ad",
      type: "Debit",
      amount: req.body.estimate,
      user: req.user._id,
    });
    if (payList.balance < 0) {
      return res
        .status(404)
        .send({ message: "You do nave enough balance in your account." });
    }
    payment.balance = payList.balance - req.body.estimate;
    sponsor.sponsor = AppConstant.SPONSOR.REQUEST_PENDING;
    channel.sponsor = AppConstant.SPONSOR.REQUEST_PENDING;
    await channel.save();
    await payment.save();
    await sponsor.save();
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.forcedChannelSponsor = async (req, res) => {
  const sponsor = await ChannelSponsor.findOne({ _id: req.params._id });
  try {
    const channel = await Channel.findOne({
      _id: sponsor.channelId,
      user: req.user._id,
    });
    sponsor.status = AppConstant.SPONSOR.COMPLETED;
    channel.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsor.save();
    await channel.save();
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.countryList = async (req, res) => {
  try {
    const country = await Country.find();
    res.send({ country });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.stateList = async (req, res) => {
  try {
    const country = await Country.findOne({ _id: req.params.id });
    const state = await State.find({ country: req.params.id });
    res.send({ country, state });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.cityList = async (req, res) => {
  try {
    const country = await Country.findOne({ _id: req.params.id });
    const state = await State.findOne({ _id: req.params.sid });
    const city = await City.find({ state: req.params.sid });
    res.send({ country, state, city });
  } catch (error) {
    res.status(500).send(error);
  }
};

//article sponsore list
exports.sponsoredUserList = async (req, res) => {
  try {
    const sponsorArticle = await ArticleSponsor.find({
      user: req.user._id,
      status: { $ne: AppConstant.SPONSOR.BLOCK },
    }).sort({
      createdAt: -1,
    });
    const sponsorChannel = await ChannelSponsor.find({
      user: req.user._id,
      status: { $ne: AppConstant.SPONSOR.BLOCK },
    }).sort({
      createdAt: -1,
    });

    res.send({ sponsorChannel, sponsorArticle });
  } catch (error) {
    res.status(500).send(error);
  }
};

//sponsre by id

exports.sponsoreChannelById = async (req, res) => {
  try {
    const channelSponsore = await ChannelSponsor.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate(["country", "city", "state", "language"]);
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

exports.sponsoreArticleById = async (req, res) => {
  try {
    const articleSponsore = await ArticleSponsor.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate(["country", "city", "state", "language"]);
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

exports.channelSponsorDelete = async (req, res) => {
  const sponsor = await ChannelSponsor.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  try {
    const channel = await Channel.findOne({ _id: sponsor.channelId });
    sponsor.status = AppConstant.SPONSOR.BLOCK;
    channel.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsor.save();
    await channel.save();
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.articleSponsorDelete = async (req, res) => {
  const sponsor = await ArticleSponsor.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  try {
    const article = await Article.findOne({ _id: sponsor.articleId });
    sponsor.status = AppConstant.SPONSOR.BLOCK;
    article.sponsor = AppConstant.SPONSOR.NORMAL;
    await sponsor.save();
    await article.save();
    res.send(sponsor);
  } catch (error) {
    res.status(500).send(error);
  }
};

//article sponsore
exports.articleSponsorePublic = async (req, res) => {
  try {
    const sponsoreArticles = await ArticleSponsor.find({
      status: AppConstant.SPONSOR.SPONSORED,
    })
      .populate(["country", "city", "state", "language", "articleId"])
      .limit(parseInt(req.query.limit));
    //guest user
    const sponsoreArts = sponsoreArticles.filter((item) => {
      if (
        item.country.country === "All" &&
        item.state.state === "All" &&
        item.city.city === "All" &&
        item.ageFrom >= 12 &&
        item.ageTo <= 100 &&
        item.gender === "All" &&
        item.language.language === "English"
      ) {
        return item;
      }
    });
    let sponsoreArtsAuthUser;
    if (req.user) {
      //auth user
      const preference = await Preference.findOne({ user: req.user._id })
        .select(["-keyword", "-intersted", "-visited"])
        .populate(["country", "city", "state", "language"]);
      sponsoreArtsAuthUser = sponsoreArticles.filter((item) => {
        if (
          item.country.country === "All" &&
          item.state.state === "All" &&
          item.city.city === "All" &&
          item.ageFrom === 12 &&
          item.ageTo === 100 &&
          item.gender === "All"
        ) {
          // return item;
        } else {
          const currentDate = new Date();
          const userAge = currentDate.getFullYear() - preference.year;
          if (
            (preference.country.country === item.country.country ||
              item.country.country === "All") &&
            (preference.state.state === item.state.state ||
              item.state.state === "All") &&
            (preference.city.city === item.city.city ||
              item.city.city === "All") &&
            (preference.language.language === item.language.language ||
              item.language.language === "English") &&
            (userAge >= item.ageFrom || item.ageFrom >= 12) &&
            (userAge <= item.ageTo || item.ageTo <= 100) &&
            (preference.gender === item.gender || item.gender === "All")
          ) {
            return { item };
          }
        }
      });
    }
    const articleguest = await sponsoreArts.map((item) => item.articleId);
    const articlesId = await sponsoreArtsAuthUser.map((item) => item.articleId);
    const articles = await Article.find({ _id: articlesId }).populate(
      "channel"
    );
    const articlesGuest = await Article.find({ _id: articleguest }).populate(
      "channel"
    );
    res.send({ articles, articlesGuest });
    //login user
  } catch (error) {
    res.status(500).send(error);
  }
};

//channel sponosre

exports.channleSponsorePublic = async (req, res) => {
  try {
    const sponsoreChannels = await ChannelSponsor.find({
      status: AppConstant.SPONSOR.SPONSORED,
    })
      .populate(["country", "city", "state", "language", "channelId"])
      .limit(parseInt(req.query.limit));
    //guest user
    const sponsoreChann = sponsoreChannels.filter((item) => {
      if (
        item.country.country === "All" &&
        item.state.state === "All" &&
        item.city.city === "All" &&
        item.ageFrom >= 12 &&
        item.ageTo <= 100 &&
        item.gender === "All" &&
        item.language.language === "English"
      ) {
        return item;
      }
    });
    let sponsoreChannAuthUser;
    if (req.user) {
      //auth user
      const preference = await Preference.findOne({ user: req.user._id })
        .select(["-keyword", "-intersted", "-visited"])
        .populate(["country", "city", "state", "language"]);
      sponsoreChannAuthUser = sponsoreChannels.filter((item) => {
        if (
          item.country.country === "All" &&
          item.state.state === "All" &&
          item.city.city === "All" &&
          item.ageFrom === 12 &&
          item.ageTo === 100 &&
          item.gender === "All"
        ) {
          // return item;
        } else {
          const currentDate = new Date();
          const userAge = currentDate.getFullYear() - preference.year;
          if (
            (preference.country.country === item.country.country ||
              item.country.country === "All") &&
            (preference.state.state === item.state.state ||
              item.state.state === "All") &&
            (preference.city.city === item.city.city ||
              item.city.city === "All") &&
            (preference.language.language === item.language.language ||
              item.language.language === "English") &&
            (userAge >= item.ageFrom || item.ageFrom >= 12) &&
            (userAge <= item.ageTo || item.ageTo <= 100) &&
            (preference.gender === item.gender || item.gender === "All")
          ) {
            return { item };
          }
        }
      });
    }

    const channelguests = await sponsoreChann.map((item) => item.channelId);
    const channelsId = await sponsoreChannAuthUser.map(
      (item) => item.channelId
    );
    const channels = await Channel.find({ _id: channelsId });
    const channelGuest = await Channel.find({
      _id: channelguests,
    });

    //guest
    const followChann = [];
    channelGuest
      .map((single) => single.follows)
      .map((single) =>
        single.filter((double) => {
          if (double.user.toString() === req.user._id.toString())
            followChann.push(double.channel.toString());
        })
      );
    const chan = channelGuest.map((chans) => chans._id.toString());
    const myArray = chan.filter((i) => followChann.indexOf(i) === -1);
    const channelGuestList = await Channel.find({ _id: myArray });
    //auth
    const followChann1 = [];
    channels
      .map((single) => single.follows)
      .map((single) =>
        single.filter((double) => {
          if (double.user.toString() === req.user._id.toString())
            followChann1.push(double.channel.toString());
        })
      );
    const chan1 = channels.map((chans) => chans._id.toString());
    const myArray1 = chan1.filter((i) => followChann1.indexOf(i) === -1);
    const channelsAuthList = await Channel.find({ _id: myArray1 });

    res.send({ channelGuestList, channelsAuthList });
    //login user
  } catch (error) {
    res.status(500).send(error);
  }
};
