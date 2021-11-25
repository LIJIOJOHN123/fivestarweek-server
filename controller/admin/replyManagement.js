const AppConstant = require("../../config/appConstants");
const AcitivityHistory = require("../../model/ActivityHistory");
const Reply = require("../../model/Reply");

/**************************** Reply ****************************************/
//name:  comment list
//desc: list of comments

exports.reply_list = async (req, res) => {
  try {
    const replyCount = await Reply.find().countDocuments();
    const replies = await Reply.find()
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });
    res.send({ replies, replyCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
//name:Block  reply
//desc: block reply
exports.reply_block = async (req, res) => {
  try {
    const reply = await Reply.findOne({ _id: req.params.id });
    reply.status = AppConstant.REPLY_STATUS.BLOCKED;
    await reply.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} blocked this reply.`,
      user: req.user._id,
      approved: req.user._id,
      type: "reply_managment",
    });
    await activity.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Unblock  reply
//desc: unblock reply

exports.reply_unblock = async (req, res) => {
  try {
    const reply = await Reply.findOne({ _id: req.params.id });
    reply.status = AppConstant.REPLY_STATUS.ACTIVE;
    await reply.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} unblock this reply.`,
      user: req.user._id,
      approved: req.user._id,
      type: "reply_managment",
    });
    await activity.save();
    res.send(reply);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.reply_violation_list = async (req, res) => {
  try {
    const reply = await Reply.find();
    const reason = reply.filter((item) => {
      if (item.violation.length > 0) {
        return item;
      }
    });
    res.send(reason);
  } catch (error) {
    res.status(500).send(error);
  }
};

//reply search
exports.reply_search = async (req, res) => {
  let search = req.query.key;
  try {
    let replies = await Reply.find({
      $or: [{ reply: { $regex: search, $options: "i" } }],
    }).sort({ createdAt: -1 });

    res.send({ replies });
  } catch (error) {
    res.status(500).send(error);
  }
};
