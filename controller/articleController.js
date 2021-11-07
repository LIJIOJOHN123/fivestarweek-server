const Article = require("../model/Article");
const Channel = require("../model/Channel");
const AppConstant = require("../config/appConstants");
const { validationResult } = require("express-validator");
const extract = require("meta-extractor");
const urlMetadata = require("url-metadata");
const exportIdGenerator = require("../config/IDGenerator");
const Publisher = require("../model/Publisher");
const Notification = require("../model/Notification");
const Language = require("../model/Language");
const Score = require("../model/Score");
const Preference = require("../model/Preference");
const ArticleViewAuth = require("../model/ArticleViewAuth");
const ArticleViewIP = require("../model/ArticleViewIP");
const ArticleVisitAuth = require("../model/ArticleVisitorAuth");
const ArticleVisitIP = require("../model/ArticleVisitorIP");
const ArticleSponsor = require("../model/SponsorArticle");
const mongoose = require("mongoose");

//name:Create Article
//desc: craete article
//status:@private
exports.createArticle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const articles = await Article.findOne({
      user: req.user._id,
      channel: req.params.id,
      link: req.body.link,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    });

    if (articles) {
      return res
        .status(404)
        .send({ message: "Article already exist in this channel" });
    }

    const newArticle = {
      user: req.user._id,
      channel: req.params.id,
      link: req.body.link,
    };

    try {
      const data = await extract({ uri: req.body.link });
      const article = new Article(newArticle);
      const artLink = data.title.toLowerCase().trim().replace(/\s/g, "");
      const art = {
        link: req.body.link,
        title: data.title,
        description: data.description,
        image: data.ogImage,
        source: data.host,
        keywords: data.keywords,
      };
      article.slug = artLink;
      article.title = data.title;
      article.description = data.description;
      article.articleId = exportIdGenerator(30);
      article.image = data.ogImage;
      article.source = data.host;
      if (article.source == "www.youtube.com") {
        article.type = "Video";
      }
      article.keywords = data.keywords;
      let publishers = await Publisher.findOne({ publisher: article.source });
      let dataExtractionT;
      if (!publishers) {
        dataExtractionT = new Publisher({
          publisher: article.source,
          publisherId: exportIdGenerator(30),
        });
        dataExtractionT.articleIds.unshift(article._id);
        article.publisherId = dataExtractionT._id;
        await dataExtractionT.save();
      } else {
        publishers.articleIds.push(article._id);
        article.publisherId = publishers._id;
        await publishers.save();
      }
      article.articleDetails.push(data);
      await article.save();
      const channelSecond = await Channel.findOne({ _id: req.params.id });
      await channelSecond.follows.map(async (single) => {
        const newNotification = new Notification({
          receiveUser: single.user,
          message: `@${channelSecond.channelName} posted new item ${article.title}`,
          id: `${article._id}`,
          type: "article",
        });
        newNotification.what.push(article);
        newNotification.who.push(channelSecond);
        await newNotification.save();
      });
      const scorePrev = await Score.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });
      const userScore = new Score({
        user: req.user._id,
        activity: "Article",
        description: `Article added to FiveStarWeek - ${article.title}`,
        mode: "Credit",
        points: 2,
        totalScore: scorePrev === null ? 2 : scorePrev.totalScore + 2,
      });
      await userScore.save();
      return res.send(article);
    } catch (error) {
      if (error) {
        try {
          const dataExtractionFirst = await urlMetadata(req.body.link);
          const article = new Article(newArticle);
          const artLink = dataExtractionFirst.title
            .toLowerCase()
            .trim()
            .replace(/\s/g, "");
          const art = {
            link: req.body.link,
            title: dataExtractionFirst.title,
            description: dataExtractionFirst.description,
            image: dataExtractionFirst.image,
            source: dataExtractionFirst.source,
            keywords: dataExtractionFirst.keywords,
          };
          article.title = dataExtractionFirst.title;
          article.articleId = await exportIdGenerator(30);
          article.description = dataExtractionFirst.description;
          article.image = dataExtractionFirst.image;
          article.source = dataExtractionFirst.source;
          article.keywords.push(dataExtractionFirst.keywords);
          article.slug = artLink;
          let publisherExist;
          publisherExist = await Publisher.findOne({
            publisher: dataExtractionFirst.source,
          });
          if (publisherExist) {
            publisherExist.articleIds.unshift(article._id);
            article.publisherId = publisherExist._id;
            await publisherExist.save();
          } else {
            let datas = new Publisher({
              publisher: dataExtractionFirst.source,
              publisherId: exportIdGenerator(30),
            });
            datas.articleIds.unshift(article._id);
            article.publisherId = datas._id;
            await datas.save();
            const scorePrev = await Score.findOne({ user: req.user._id }).sort({
              createdAt: -1,
            });
            const userScore = new Score({
              user: req.user._id,
              activity: "Article",
              description: `Article added to FiveStarWeek - ${article.title}`,
              mode: "Credit",
              points: 2,
              totalScore: scorePrev === null ? 2 : scorePrev.totalScore + 2,
            });
            await userScore.save();
          }

          if (article.source !== "hwnews.in") {
            article.articleDetails.push(dataExtractionFirst);
          }
          const channelList = await Channel.findOne({ _id: req.params.id });
          await channelList.follows.map(async (item) => {
            const newNotification = await new Notification({
              receiveUser: item.user,
              message: `@${channelList.channelName} posted new item ${article.title}`,
              type: "article",
              who: channelList._id,
              id: article._id,
            });
            newNotification.what.push(article);
            newNotification.who.push(channelList);
            await newNotification.save();
          });
          await article.save();

          res.send(article);
        } catch (error) {}
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Get Article
//desc: get articles by channel - only for created user
//status:@private
exports.getAllArticle = async (req, res) => {
  try {
    const articles = await Article.find({
      user: req.user._id,
      channel: req.params.id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
    })
      .sort({
        createdAt: -1,
      })
      .populate("channel");
    res.send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unlike Article
//desc: remove like from the article
//status:@private
exports.getAllArticlesByChannel = async (req, res) => {
  try {
    const articles = await Article.find({
      channel: req.params.id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
    });
    if (!articles) {
      return res.status(404).send("Article not found");
    }
    res.send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Like Article
//desc: like article
//status:@private
exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    });
    if (
      article.likes.filter(
        (like) => like.user.toString() === req.user._id.toString()
      ).length > 0
    ) {
      return res
        .status(404)
        .send({ message: "You have already liked this article" });
    }
    article.likes.unshift({ user: req.user._id });
    const notification = new Notification({
      receiveUser: article.user,
      type: "article",
      message: `${req.user.name} likes your post ${article.title}`,
    });
    notification.who.push({
      user: req.user._id,
      avatar: req.user.avatar,
      name: req.user.name,
    });
    notification.what.push(article);
    await article.likes.map(async (item) => {
      const collageNotificaiton = new Notification({
        receiveUser: item.user,
        type: "article",
        message: `${req.user.name} also liked  ${article.title}`,
      });
      collageNotificaiton.who.push({
        user: req.user._id,
        channel: req.params.id,
      });
      collageNotificaiton.what.push(article);
      await collageNotificaiton.save();
    });

    await notification.save();
    await article.save();
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unlike Article
//desc: remove like from the article
//status:@private
exports.unlikeArticle = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    });
    if (
      article.likes.filter(
        (like) => like.user.toString() === req.user._id.toString()
      ).length === 0
    ) {
      return res.status(404).send("You have not liked this article");
    }
    const index = article.likes.findIndex(
      (like) => like.user.toString() === req.user._id.toString()
    );
    article.likes.splice(index, 1);
    await article.save();
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Get Single Aarticle
//desc: get single article
//status:@public
exports.getArticlesById = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    }).populate("channel");

    const channelArticleList = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      channel: article.channel._id,
    })
      .populate("channel")
      .sort({ createdAt: -1 })
      .limit(8);
    const relatedDiscussion = await Article.find({ link: article.link })
      .limit(4)
      .populate("channel");

    res.send({
      article,
      channelArticleList,
      relatedDiscussion,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
//name:Get All Aarticle
//desc: get all article
//status:@public

exports.getAllArticles = async (req, res) => {
  try {
    const articlesCount = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
    }).countDocuments();
    const articles = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
    })
      .populate("channel")
      .limit(parseInt(req.query.limit));

    res.send({ articles, articlesCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Get All Articles
//desc: get all articles from following channel
//status:@private
exports.getArticlesFollowers = async (req, res) => {
  let page = parseInt(req.query.page);
  try {
    const channels = await Channel.find({
      "follows.user": req.user._id,
    }).select("_id");
    const chanIds = await channels.map((item) => item._id);
    const articlesCount = await Article.find({
      channel: chanIds,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    }).countDocuments();
    const articles = await Article.find({
      channel: chanIds,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    })
      .sort({
        createdAt: -1,
      })
      .populate("channel")
      .limit(parseInt(page * 12));
    //sponsored articles : 4 top
    let sponsoredArticles = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      sponsor: AppConstant.SPONSOR.SPONSORED,
    }).limit(4);

    res.send({
      articlesCount,
      articles,
      sponsoredArticles,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Violate Articles
//desc: post violated articles
//status:@private
exports.violationArticle = async (req, res) => {
  try {
    const article = await Article.findOne({ _id: req.params.id });
    article.violation.push({ user: req.user_id, reason: req.body.reason });
    await article.save();
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:View Articles
//desc: post view details
//status:@private

exports.articleViewDetailsAuth = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
    });
    const newView = {
      user: req.user._id,
      ip: req.body.ip,
      article: req.params.id,
      country: req.body.country,
      state: req.body.region,
      keywords: article.keywords.toString(),
    };
    const visitedArticle = new ArticleViewAuth(newView);
    await visitedArticle.save();
    article.view.unshift(visitedArticle._id);
    await article.save();
    if (article.sponsor === AppConstant.SPONSOR.SPONSORED) {
      const aricleSponsore = await ArticleSponsor.findOne({
        articleId: article._id,
      }).sort({ createdAt: -1 });
      aricleSponsore.authViews.unshift(visitedArticle._id);
      await aricleSponsore.save();
    }
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//IP Address
// Get user Id address and details
exports.articleViewIpDetails = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
    });
    const newView = {
      ip: req.body.ip,
      article: req.params.id,
      country: req.body.country,
      state: req.body.region,
      keywords: article.keywords.toString(),
    };
    const views = await ArticleViewIP(newView);
    await views.save();
    await article.viewIP.unshift(views._id);
    await article.save();
    if (article.sponsor === AppConstant.SPONSOR.SPONSORED) {
      const aricleSponsore = await ArticleSponsor.findOne({
        articleId: article._id,
      }).sort({ createdAt: -1 });
      aricleSponsore.guestViews.unshift(views._id);
      await aricleSponsore.save();
    }
    res.send({});
  } catch (error) {
    res.status(500).send(error);
  }
};
//name:Visit Articles
//desc: post vist details
//status:@private
exports.articleVisitDetailsAuth = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
    });
    const newView = {
      user: req.user._id,
      ip: req.body.ip,
      article: req.params.id,
      country: req.body.country,
      state: req.body.region,
      keywords: article.keywords.toString(),
    };
    const visitedArticle = new ArticleVisitAuth(newView);
    await visitedArticle.save();
    article.visit.unshift(visitedArticle._id);
    await article.save();
    const pref = await Preference.findOne({ user: req.user._id });
    pref.visited.unshift({ articles: article._id });
    if (article.sponsor === AppConstant.SPONSOR.SPONSORED) {
      const aricleSponsore = await ArticleSponsor.findOne({
        articleId: article._id,
      }).sort({ createdAt: -1 });
      aricleSponsore.authVisit.unshift(visitedArticle._id);
      await aricleSponsore.save();
    }
    const uniquevistor = await ArticleVisitAuth.findOne({
      article: req.params.id,
    })
      .distinct("user")
      .countDocuments();
    let thresh = 2; //points
    const scores =
      (await Score.find({
        type: "Visit",
        user: req.user._id,
      }).countDocuments()) * 5;
    const results = uniquevistor / thresh;
    const bala = results - scores;
    const scorePrev = await Score.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (bala === 1) {
      const userScore = new Score({
        user: article.user,
        activity: "Visit",
        description: `You have viewed 100 articles`,
        mode: "Credit",
        points: 5,
        totalScore: scorePrev === null ? 5 : scorePrev.totalScore + 5,
      });
      await userScore.save();
    }

    //passive
    const uniquevistors = await ArticleViewAuth.find({
      user: req.user._id,
    })
      .distinct("user")
      .countDocuments();
    let threshhold = 2; //thresh
    const score =
      (await Score.find({
        type: "Visited",
        user: article.user,
      }).countDocuments()) * 5;
    const result = uniquevistors / threshhold;
    let balance = result - score;
    const scorePrevs = await Score.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (balance === 1) {
      const userScore = new Score({
        user: article.user,
        activity: "Visited",
        description: `You have 250 more visitors viewed  article ${req.user._id}`,
        mode: "Credit",
        points: 5,
        totalScore: scorePrevs === null ? 5 : scorePrevs.totalScore + 5,
      });
      await userScore.save();
    }
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//IP Address
// Get user Id address and details
exports.articleVisitIpDetails = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
    });
    const newView = {
      ip: req.body.ip,
      article: req.params.id,
      country: req.body.country,
      state: req.body.region,
      keywords: article.keywords.toString(),
    };
    const views = await ArticleVisitIP(newView);
    article.visitIP.unshift(views._id);
    await article.save();
    await views.save();
    if (article.sponsor === AppConstant.SPONSOR.SPONSORED) {
      const aricleSponsore = await ArticleSponsor.findOne({
        articleId: article._id,
      }).sort({ createdAt: -1 });
      aricleSponsore.guestVisit.unshift(views._id);
      await aricleSponsore.save();
    }
    res.send(views);
  } catch (error) {
    res.status(500).send(error);
  }
};

//Home Channel Articles
//Get home channels articles

exports.homeChannelArticles = async (req, res) => {
  try {
    const channels = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    });
    const ids = channels.map((channel) => channel._id);
    const articlesCount = await Article.find({
      channel: ids,
      type: "Article",
    }).countDocuments();
    const articles = await Article.find({
      channel: ids,
      type: "Article",
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    })
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 })
      .populate("channel");
    res.send({ articles, articlesCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

// Delete article
// delete article by id
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    article.status = AppConstant.ARTICLE_STATUS.BLOCKED;
    const scorePrev = await Score.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const userScore = new Score({
      user: req.user._id,
      activity: "Article",
      description: `Article removed to FiveStarWeek - ${article.title}`,
      mode: "Debit",
      points: 2,
      totalScore: scorePrev.totalScore - 2,
    });
    await article.save();
    await userScore.save();
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getMobileFollowingMixed = async (req, res) => {
  const limit = req.query.page;
  const language = req.query.language;

  try {
    const channels = await Channel.find({
      "follows.user": req.user._id,
    }).select("_id");
    const chanIds = await channels.map((item) => item._id);

    const articlesCount = await Article.find({
      channel: chanIds,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    })
      .sort({
        createdAt: -1,
      })
      .countDocuments();

    const articles = await Article.find({
      channel: chanIds,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    })
      .sort({
        createdAt: -1,
      })
      .populate("channel")
      .limit(parseInt(limit * 9));
    const languageSearch = await Language.findOne({ language: language });
    const channelsByLanguage = await Channel.find({
      language: languageSearch.language,
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    });
    const lead = channelsByLanguage.filter((item) =>
      item.follows.findIndex(
        (chann) => chann.user.toString() === req.user._id.toString()
      )
    );
    const suggestedChannel = lead.filter((val, i) => i < 8);

    res.send({ suggestedChannel, articles, articlesCount });
  } catch (error) {
    res.status(404).send(error);
  }
};

exports.articleDetailStatitics = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
    });
    //view  ip
    const viewIp = await ArticleViewIP.aggregate([
      {
        $match: {
          article: mongoose.Types.ObjectId(article._id),
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
    //view auth
    const viewAuth = await ArticleViewAuth.aggregate([
      {
        $match: {
          article: mongoose.Types.ObjectId(article._id),
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
    //vist ip
    const visitIps = await ArticleVisitIP.aggregate([
      {
        $match: {
          article: mongoose.Types.ObjectId(article._id),
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
    //visit auth
    const authVisit = await ArticleVisitAuth.aggregate([
      {
        $match: {
          article: mongoose.Types.ObjectId(article._id),
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
      article: article._id,
    }).countDocuments();
    //view  ip
    const viewIps = await ArticleViewIP.find({
      article: article._id,
    }).countDocuments();
    //visit
    const visitAuth = await ArticleVisitAuth.find({
      article: article._id,
    }).countDocuments();
    //visit auth
    const visitIp = await ArticleVisitIP.find({
      article: article._id,
    }).countDocuments();

    res.send({
      article,
      viewIp,
      viewsauth,
      viewIps,
      visitAuth,
      visitIp,
      viewAuth,
      visitIps,
      authVisit,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
