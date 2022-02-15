const Article = require("../../model/Article");
const Channel = require("../../model/Channel");
const AppConstant = require("../../config/appConstants");
const { validationResult } = require("express-validator");
const extract = require("meta-extractor");
const urlMetadata = require("url-metadata");
const exportIdGenerator = require("../../config/IDGenerator");
const Publisher = require("../../model/Publisher");
const Notification = require("../../model/Notification");
const Score = require("../../model/Score");
const Preference = require("../../model/Preference");
const ArticleViewAuth = require("../../model/ArticleViewAuth");
const ArticleViewIP = require("../../model/ArticleViewIP");
const ArticleVisitAuth = require("../../model/ArticleVisitorAuth");
const ArticleVisitIP = require("../../model/ArticleVisitorIP");
const ArticleSponsor = require("../../model/SponsorArticle");
const mongoose = require("mongoose");

//name:Create Article
//desc: craete article
//status:@private
exports.article_create = async (req, res) => {
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
        if (publishers.status === AppConstant.PUBLISHER_STATUS.BLOCKED) {
          return res.status(404).send({
            message:
              "This website has been blocked and will block your if you post any item from same website",
          });
        }
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
          whoAvatar: `${channelSecond.avatar && channelSecond.avatar.image}`,
          webRedirection: `${process.env.CLIENT_URL}/article/${article._id}`,
          mobileRedirection: `${article._id}`,
        });
        await newNotification.save();
      });
      const score_previous = await Score.aggregate([
        {
          $match: {
            $and: [{ user: req.user._id }],
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$points",
            },
          },
        },
      ]);
      const scorePrev = score_previous[0].total;

      const userScore = new Score({
        user: req.user._id,
        activity: "Article",
        description: `Article added to FiveStarWeek - ${article.title}`,
        mode: "Credit",
        points: 2,
        totalScore: scorePrev + 2,
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
            if (
              publisherExist.status === AppConstant.PUBLISHER_STATUS.BLOCKED
            ) {
              return res.status(404).send({
                message:
                  "This website has been blocked and will block your if you post any item from same website",
              });
            }
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
            const score_previous = await Score.aggregate([
              {
                $match: {
                  $and: [{ user: req.user._id }],
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: "$points",
                  },
                },
              },
            ]);
            const scorePrev = score_previous[0].total;
            const userScore = new Score({
              user: req.user._id,
              activity: "Article",
              description: `Article added to FiveStarWeek - ${article.title}`,
              mode: "Credit",
              points: 2,
              totalScore: scorePrev + 2,
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
              whoAvatar: `${channelList.avatar && channelList.avatar.image}`,
              id: article._id,
              webRedirection: `${process.env.CLIENT_URL}/article/${article._id}`,
              mobileRedirection: `${article._id}`,
            });
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
exports.article_list_by_channel_crated_user = async (req, res) => {
  try {
    const articles = await Article.find({
      user: req.user._id,
      channel: req.params.id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
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

//name:Like Article
//desc: like article
//status:@private
exports.article_like = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    }).populate(["channel", "user"]);
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
      whoAvatar: `${req.user.avatar && req.user.avatar.image}`,
      webRedirection: `${process.env.CLIENT_URL}/article/${article._id}`,
      mobileRedirection: `${article._id}`,
    });

    await article.likes.map(async (item) => {
      const collageNotificaiton = new Notification({
        receiveUser: item.user,
        type: "article",
        message: `${req.user.name} also likes  ${article.title}`,
        whoAvatar: `${req.user.avatar && req.user.avatar.image}`,
        webRedirection: `${process.env.CLIENT_URL}/article/${article._id}`,
        mobileRedirection: `${article._id}`,
      });
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
exports.article_unlike = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    }).populate(["channel", "user"]);
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
exports.article_by_id = async (req, res) => {
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
      .limit(12);
    const items = channelArticleList.findIndex(
      (item) => item._id.toString() == article._id.toString()
    );
    channelArticleList.splice(items, 1);
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

//name:Get All Articles
//desc: get all articles from following channel
//status:@private
exports.article_list_by_channel_followers = async (req, res) => {
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
exports.article_violation = async (req, res) => {
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

exports.article_view_auth = async (req, res) => {
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
exports.aritcle_view_public = async (req, res) => {
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
exports.article_visit_auth = async (req, res) => {
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
      user: req.user._id,
    }).countDocuments();
    let thresh = 30; //points
    const score_all = await Score.aggregate([
      {
        $match: {
          $and: [{ activity: "Visit" }, { user: req.user._id }],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$points",
          },
        },
      },
    ]);
    let scores = score_all[0]
      ? Math.floor((score_all[0].total / 5) * thresh)
      : 0;
    const bala = uniquevistor - scores;

    const score_previous = await Score.aggregate([
      {
        $match: {
          $and: [{ user: req.user._id }],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$points",
          },
        },
      },
    ]);
    const scorePrev = score_previous[0].total;
    if (bala > thresh) {
      const results = bala / thresh;
      let num = Math.floor(results);
      let mark = num * 5;
      const userScore = new Score({
        user: article.user,
        activity: "Visit",
        description: `You have visited ${bala} articles`,
        mode: "Credit",
        points: mark,
        totalScore: parseInt(scorePrev) + mark,
      });
      await userScore.save();
    }

    //passive
    const uniquevistors = await ArticleViewAuth.find({
      article: req.params.id,
    })
      .distinct("user")
      .countDocuments();
    let threshhold = 4; //thresh

    const score_visitor_point = await Score.aggregate([
      {
        $match: {
          $and: [{ activity: "Visited" }, { user: req.user._id }],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$points",
          },
        },
      },
    ]);
    let score_visitor = score_visitor_point[0]
      ? Math.floor((score_visitor_point[0].total / 10) * threshhold)
      : 0;
    const balan = uniquevistors - score_visitor;

    if (balan > threshhold) {
      const results = balan / threshhold;
      let num = Math.floor(results);
      let mark = num * 10;
      const userScore = new Score({
        user: article.user,
        activity: "Visited",
        description: `You have ${balan} more people visited  article ${req.user._id}`,
        mode: "Credit",
        points: mark,
        totalScore: parseInt(scorePrev) + mark,
      });
      await userScore.save();
    }
    res.send(article);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

//IP Address
// Get user Id address and details
exports.article_visit_public = async (req, res) => {
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

// Delete article
// delete article by id
exports.article_delete = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    article.status = AppConstant.ARTICLE_STATUS.BLOCKED;
    const score_previous = await Score.aggregate([
      {
        $match: {
          $and: [{ user: req.user._id }],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$points",
          },
        },
      },
    ]);
    const scorePrev = score_previous[0].total;
    const userScore = new Score({
      user: req.user._id,
      activity: "Article",
      description: `Article removed from Fivestarweek- ${article.title}`,
      mode: "Debit",
      points: 2,
      totalScore: scorePrev - 2,
    });
    await article.save();
    await userScore.save();
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.article_statitcs = async (req, res) => {
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

//home articles

exports.article_home = async (req, res) => {
  try {
    const language = req.query.language;
    const channels = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
      home: true,
      language,
    });
    let channelIds = await channels.map((channel) => channel._id);
    const articlesCount = await Article.find({
      channel: channelIds,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    }).countDocuments();
    const articles = await Article.find({
      channel: channelIds,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit))
      .populate("channel");
    const channelGuest = await Channel.find({
      language: req.query.language,
    }).limit(parseInt(6));
    res.send({ articles, channelGuest, articlesCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
