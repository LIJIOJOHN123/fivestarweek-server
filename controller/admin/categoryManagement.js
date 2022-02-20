const AppConstant = require("../../config/appConstants");
const Category = require("../../model/Category");

/**************************** category ****************************************/

//name:category create
//desc: create new category
exports.category_create = async (req, res) => {
  try {
    const newCategory = {
      category: req.body.category,
      localCategory: req.body.localCategory,
      language: req.body.language,
    };
    const category = new Category(newCategory);
    await category.save();
    res.send(category);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

//get all category
exports.category_list = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    await categories;
    res.send({ categories });
  } catch (error) {
    res.status(500).send(error);
  }
};
//get  category by id
exports.category_by_id = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id }).populate(
      "channels"
    );
    await category;
    res.send({ category });
  } catch (error) {
    res.status(500).send(error);
  }
};
//add channels
exports.category_add_channel = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    if (
      category.channels.filter(
        (channel) => channel.toString() === req.params.cid.toString()
      ).length > 0
    ) {
      return res.status(404).send("You have already followed this channel");
    }
    category.channels.unshift(req.params.cid);
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};
//remove channels
exports.category_remove_channel = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    if (
      category.channels.filter(
        (channel) => channel.toString() === req.params.cid.toString()
      ).length === 0
    ) {
      return res.status(404).send("You have not followed this channel");
    }
    const index = category.channels.findIndex(
      (channel) => channel.toString() === req.params.cid.toString()
    );
    category.channels.splice(index, 1);
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};
//block category
exports.category_block = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    category.status = AppConstant.CATEGORY.BLOCKED;
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};
//unblock category
exports.category_unblock = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    category.status = AppConstant.CATEGORY.ACTIVE;
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};
//name:Edit  category
exports.category_edit = async (req, res) => {
  try {
    const udpates = Object.keys(req.body);
    const category = await Category.findOne({ _id: req.params.id });
    udpates.map((update) => (category[update] = req.body[update]));
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
};
