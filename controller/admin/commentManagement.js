const AppConstant = require("../../config/appConstants");
const AcitivityHistory = require("../../model/ActivityHistory");
const Comment = require("../../model/Comment");

/**************************** Comments ****************************************/

//name:get Violated comments
//desc: get violated comments
exports.comment_violation_list = async (req, res) => {
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
exports.comment_list = async (req, res) => {
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

//name:Block  comment
//desc: block comment
exports.comment_block = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    comment.status = AppConstant.COMMENT_STATUS.BLOCKED;
    await comment.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} blocked this comment.`,
      user: req.user._id,
      approved: req.user._id,
      type: "comment_managment",
    });
    await activity.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unblock  comment
//desc: unblock comment

exports.comment_unblock = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    comment.status = AppConstant.COMMENT_STATUS.ACTIVE;
    await comment.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} unblcoked this comment.`,
      user: req.user._id,
      approved: req.user._id,
      type: "comment_managment",
    });
    await activity.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//comment search
exports.comment_search = async (req, res) => {
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
