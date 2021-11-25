const AppConstant = require("../../config/appConstants");
const Article = require("../../model/Article");

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
