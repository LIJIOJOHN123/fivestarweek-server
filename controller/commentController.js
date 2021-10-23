const Comment = require("../model/Comment");
const Artcile = require("../model/Article");
const AppConstant = require("../config/appConstants");
const { validationResult } = require("express-validator");
const exportIdGenerator = require("../config/IDGenerator");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Notification = require("../model/Notification");
const Score = require("../model/Score");
const Article = require("../model/Article");
//name:Create Comment
//desc: create comment
//status:@private

exports.addComment = async (req, res) => {
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
    });
    notification.who.push({
      user: req.user._id,
      avatar: req.user.avatar,
      name: req.user.name,
    });
    notification.what.push(comment);
    await article.comments.map(async (item) => {
      const collageNotificaiton = new Notification({
        receiveUser: item,
        type: "comment",
        message: `${req.user.name}  commented on your post ${comment.title}`,
      });
      collageNotificaiton.who.push({
        user: req.user._id,
        avatar: req.user.avatar,
        name: req.user.name,
      });
      collageNotificaiton.what.push(comment);
      await collageNotificaiton.save();
    });

    await notification.save();
    const scorePrev = await Score.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const userScore = new Score({
      user: req.user._id,
      activity: "Comment",
      description: `new comment posted - ${comment.comment}`,
      mode: "Credit",
      points: 3,
      totalScore: scorePrev === null ? 3 : scorePrev.totalScore + 3,
    });
    await userScore.save();
    await article.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Get comment
//desc: get all comments by user
//status:@private
exports.getComment = async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.user._id });
    res.send(comments);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Get comment By id
//desc: get single comment by id  for each user
//status:@private
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id }).populate(
      "user"
    );
    if (!comment) {
      res.status(404).send("Comment not exists");
    }
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Edit comment
//desc: edit  single comment by id  for each user
//status:@private
exports.editCommentById = async (req, res) => {
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
exports.likeComment = async (req, res) => {
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
exports.unlikeComment = async (req, res) => {
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
exports.violationComment = async (req, res) => {
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
exports.getComments = async (req, res) => {
  try {
    const commentCount = await Comment.find({
      article: req.params.id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    }).countDocuments();
    const comments = await Comment.find({
      article: req.params.id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    })
      .populate({ path: "user", select: "-email" })
      .sort({ createdAt: -1 });

    res.send({ comments, commentCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
//name:Get all comments - mobile
//desc: get all  comments
//status:@public
exports.getMobileComment = async (req, res) => {
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
      .sort({ createdAt: -1 });
    const relatedDiscussion = await Article.find({
      article: req.params.id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    }).limit(4);
    const article = await Article.findOne({
      _id: req.params.id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    });
    const channelArticles = await Article.find({
      channel: article.channel,
    }).limit(8);
    res.send({ comments, commentCount, relatedDiscussion, channelArticles });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Get comments by id
//desc: get single comment
//status:@public

exports.getSingleComment = async (req, res) => {
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
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      user: req.user._id,
      _id: req.params.id,
    });
    comment.status = AppConstant.COMMENT_STATUS.BLOCKED;
    const scorePrev = await Score.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const userScore = new Score({
      user: req.user._id,
      activity: "Comment",
      description: `new comment deleted - ${comment.comment}`,
      mode: "Debit",
      points: 3,
      totalScore: scorePrev.totalScore - 3,
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

exports.getCommentsByUser = async (req, res) => {
  try {
    const commentCount = await Comment.find({
      user: req.user._id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    }).countDocuments();
    const comments = await Comment.find({
      user: req.user._id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    })
      .populate(["channel", "article"])
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit))
      .populate("article");
    res.send({ commentCount, comments });
  } catch (error) {
    res.status(500).send(error);
  }
};

//
exports.getPublicCommentByUser = async (req, res) => {
  try {
    const commentCount = await Comment.find({
      user: req.params.id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
      showPublic: true,
    }).countDocuments();
    const comments = await Comment.find({
      user: req.params.id,
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit))
      .populate("article");
    res.send({ commentCount, comments });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.changePublicStatus = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("article");
    switch (comment.showPublic) {
      case true:
        comment.showPublic = false;
        await comment.save();
        break;
      case false:
        comment.showPublic = true;
        await comment.save();
    }
    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
};
