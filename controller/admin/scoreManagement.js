const AcitivityHistory = require("../../model/ActivityHistory");
const Score = require("../../model/Score");

exports.score_list = async (req, res) => {
  try {
    const scoreList = await Score.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    res.send({ scoreList });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.score_add = async (req, res) => {
  try {
    const score_previous = await Score.aggregate([
      {
        $match: {
          $and: [{ user: req.params.id }],
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
      user: req.params.id,
      activity: req.body.activity,
      description: req.body.description,
      mode: "Credit",
      points: req.body.points,
      totalScore: scorePrev + req.body.points,
    });
    await userScore.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} added ${req.body.points}.`,
      user: req.user._id,
      approved: req.user._id,
      type: "score_management",
    });
    await activity.save();
    res.send(userScore);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.score_remove = async (req, res) => {
  try {
    const score_previous = await Score.aggregate([
      {
        $match: {
          $and: [{ user: req.params.id }],
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
      user: req.params.id,
      activity: req.body.activity,
      description: req.body.description,
      mode: "Debit",
      points: req.body.points,
      totalScore: score_previous - req.body.points,
    });
    const activity = new AcitivityHistory({
      action: `${req.user.name} removed ${req.body.points}.`,
      user: req.user._id,
      approved: req.user._id,
      type: "score_management",
    });
    await activity.save();
    await userScore.save();
    res.send(userScore);
  } catch (error) {
    res.status(500).send(error);
  }
};
