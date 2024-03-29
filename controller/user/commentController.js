const Comment = require("../../model/Comment");
const Artcile = require("../../model/Article");
const AppConstant = require("../../config/appConstants");
const { validationResult } = require("express-validator");
const exportIdGenerator = require("../../config/IDGenerator");
const Notification = require("../../model/Notification");
const Score = require("../../model/Score");

//name:Create Comment
//desc: create comment
//status:@private

exports.comment_create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const newComment = {
      user: req.user._id,
      article: req.params.id,
      title: req.body.title,
      comment: req.body.comment,
    };
    const comment = new Comment(newComment);
    comment.commentId = exportIdGenerator(25);
    const article = await Artcile.findOne({ _id: req.params.id });
    article.comments.push(comment._id);
    comment.channel = article.channel;
    await comment.save();
    //notification
    const notification = new Notification({
      receiveUser: article.user,
      type: "comment",
      message: `${req.user.name} commented on your post ${comment.title}`,
      whoAvatar: `${req.user.avatar && req.user.avatar.image}`,
      webRedirection: `${process.env.CLIENT_URL}/article/${comment.article}`,
      mobileRedirection: `${comment.article}`,
    });
    await article.comments.map(async (item) => {
      const collageNotificaiton = new Notification({
        receiveUser: item,
        type: "comment",
        message: `${req.user.name}  commented on your post ${comment.title}`,
        whoAvatar: `${req.user.avatar && req.user.avatar.image}`,
        webRedirection: `${process.env.CLIENT_URL}/article/${comment.article}`,
        mobileRedirection: `${comment.article}`,
      });

      await collageNotificaiton.save();
    });

    await notification.save();
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
      activity: "Comment",
      description: `new comment posted - ${comment.comment}`,
      mode: "Credit",
      points: 3,
      totalScore: scorePrev + 3,
    });
    await userScore.save();
    await article.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Edit comment
//desc: edit  single comment by id  for each user
//status:@private
exports.comment_edit = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    if (!comment) {
      res.status(404).send("Comment not exists");
    }
    const updates = Object.keys(req.body);
    updates.map((update) => (comment[update] = req.body[update]));
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Like comment
//desc: like  single comment by id
//status:@private
exports.comment_like = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
    });
    if (
      comment.likes.filter(
        (like) => like.user.toString() === req.user._id.toString()
      ).length > 0
    ) {
      return res.status(404).send("You have already liked this comment");
    }
    comment.likes.unshift({ user: req.user._id });
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unlinke comment
//desc: remove like from   single comment by id
//status:@private
exports.comment_unlike = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
    });
    if (
      comment.likes.filter(
        (like) => like.user.toString() === req.user._id.toString()
      ).length === 0
    ) {
      return res.status(404).send("You have not liked this comment");
    }
    const index = comment.likes.findIndex(
      (like) => like.user.toString() === req.user._id.toString()
    );
    comment.likes.splice(index, 1);
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Vioation comment
//desc: notify violation
//status:@private
exports.comment_violate = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    comment.violation.push({ user: req.user_id, reason: req.body.reason });
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Get all comments
//desc: get all  comments
//status:@public
exports.comment_list_filtered_by_article = async (req, res) => {
  try {
    const commentCount = await Comment.find({
      article: req.params.id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    }).countDocuments();
    const comments = await Comment.find({
      article: req.params.id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    })
      .limit(parseInt(req.query.limit))
      .populate({ path: "user", select: "-email" })
      .sort({ createdAt: -1 });

    res.send({ comments, commentCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Get comments by id
//desc: get single comment
//status:@public

exports.comment_by_id = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
    }).populate("user");
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//Delete comment
//delete comment by id
exports.comment_delete = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      user: req.user._id,
      _id: req.params.id,
    });
    comment.status = AppConstant.COMMENT_STATUS.BLOCKED;
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
      activity: "Comment",
      description: `new comment deleted - ${comment.comment}`,
      mode: "Debit",
      points: 3,
      totalScore: scorePrev - 3,
    });
    await comment.save();
    await userScore.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:comment by user
//desc: comment by user
//status:@public

exports.comment_list_filted_by_user = async (req, res) => {
  try {
    const commentCount = await Comment.find({
      user: req.user._id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    }).countDocuments();
    const comments = await Comment.find({
      user: req.user._id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    })
      .populate(["channel", "article", "user"])
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    res.send({ commentCount, comments });
  } catch (error) {
    res.status(500).send(error);
  }
};
