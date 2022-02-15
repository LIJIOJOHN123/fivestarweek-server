const AppConstant = require("../../config/appConstants");
const Article = require("../../model/Article");
const exportIdGenerator = require("../../config/IDGenerator");
const Publisher = require("../../model/Publisher");
const extract = require("meta-extractor");
const Notification = require("../../model/Notification");
const Channel = require("../../model/Channel");
const Score = require("../../model/Score");
//Article List
//get all articles and posts

exports.article_list = async (req, res) => {
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
exports.article_block = async (req, res) => {
  try {
    const article = await Article.findOne({ _id: req.params.id });
    const linkArticle = await Article.find({ link: article.link });
    linkArticle.map(async (single) => {
      single.status = AppConstant.ARTICLE_STATUS.BLOCKED;
      single.save();
      const activity = new AcitivityHistory({
        action: `${req.user.name} blocked this article.`,
        user: req.user._id,
        approved: req.user._id,
        type: "article_managment",
      });
      await activity.save();
      return single;
    });
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unblock article
//desc: unblock article
exports.article_unblock = async (req, res) => {
  try {
    const article = await Article.findOne({ _id: req.params.id });
    const linkArticle = await Article.find({ link: article.link });
    linkArticle.map(async (single) => {
      single.status = AppConstant.ARTICLE_STATUS.ACTIVE;
      const activity = new AcitivityHistory({
        action: `${req.user.name} unblocked this article.`,
        user: req.user._id,
        approved: req.user._id,
        type: "article_managment",
      });
      await activity.save();
      return single.save();
    });
    res.send(article);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:get Violated article
//desc: get violated aritcles
exports.article_violation_list = async (req, res) => {
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

//articlesearch
exports.article_search = async (req, res) => {
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

exports.articles_multiple = async (req, res) => {
  let datas = await req.body.data;

  try {
    // article
    for (var index = 0; index < datas.length - 1; index++) {
      const articles = await Article.findOne({
        user: datas[index].user,
        channel: datas[index].channel,
        link: datas[index].link,
        status: AppConstant.ARTICLE_STATUS.ACTIVE,
      });

      if (articles) {
        return res.status(404).send({
          message: `${index} "Article already exist in this channel"`,
        });
      }

      const newArticle = {
        user: datas[index].user,
        channel: datas[index].channel,
        link: datas[index].link,
      };
      const data = await extract({ uri: datas[index].link });
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
      let publishers = await Publisher.findOne({
        publisher: article.source,
      });

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
      const channelSecond = await Channel.findOne({
        _id: datas[index].channel,
      });
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
            $and: [{ user: datas[index].use }],
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
        user: datas[index].user,
        activity: "Article",
        description: `Article added to FiveStarWeek - ${article.title}`,
        mode: "Credit",
        points: 2,
        totalScore: scorePrev + 2,
      });
      await userScore.save();
    }
    res.status(200).send({ message: "Successfully completed" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
