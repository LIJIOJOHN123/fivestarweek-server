const AppConstant = require("../../config/appConstants");
const Category = require("../../model/Category");
const Article = require("../../model/Article");

/**************************** category ****************************************/

//get category  list - active
exports.category_list = async (req, res) => {
  try {
    const categories = await Category.find({
      status: AppConstant.CATEGORY.ACTIVE,
      language: req.params.id,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    let items = [];
    for (let i = 0; i < categories.length; i++) {
      let categoryItem = {};
      categoryItem._id = categories[i]._id;
      categoryItem.category = categories[i].category;
      categoryItem.localCategory = categories[i].localCategory;
      categoryItem.articles = await Article.find({
        channel: categories[i].channels,
      })
        .populate("channel")
        .sort({ createdAt: -1 })
        .limit(8);

      items.push(categoryItem);
    }

    res.send({ items });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
//get category  id - active
exports.category_by_id = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      status: AppConstant.CATEGORY.ACTIVE,
    });
    const articles = await Article.find({ channel: category.channels })
      .populate("channel")
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    res.send({ category, articles });
  } catch (error) {
    res.status(500).send(error);
  }
};
//follow
//name:Channel Follow
//desc: allowing users to follow channels
exports.category_subscribe = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      status: AppConstant.CATEGORY.ACTIVE,
    });
    if (
      category.users.filter(
        (user) => user.toString() === req.user._id.toString()
      ).length > 0
    ) {
      return res.status(404).send("You have already followed this channel");
    }
    await category.users.unshift(req.user._id);

    await category.save();
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};

//unfollow users
exports.category_unsubscribe = async (req, res) => {
  try {
    const channel = await Category.findOne({
      _id: req.params.id,
      status: AppConstant.CATEGORY.ACTIVE,
    });
    if (
      category.users.filter(
        (user) => user.toString() === req.user._id.toString()
      ).length === 0
    ) {
      return res.status(404).send("You have not followed this channel");
    }
    const index = category.users.findIndex(
      (user) => user.toString() === req.user._id.toString()
    );
    category.users.splice(index, 1);
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};