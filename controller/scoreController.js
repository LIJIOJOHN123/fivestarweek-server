// req  from user for sharing addings

const Score = require("../model/Score");

exports.requestToAddPoints = async () => {
  try {
    const exist = await Score.findOne({
      user: req.user._id,
      request: false,
      points: req.body.points,
    });
    if (exist) {
      return res.status(404).send("We have already your request");
    }
    const request = new Score({
      user: req.user._id,
      request: false,
      requestedPoint: req.body.requestedPoint,
    });
    await request.save();
    res.send(request);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.scorelistByUser = async (req, res) => {
  try {
    const scoreCount = await Score.find({
      user: req.user._id,
    }).countDocuments();
    const scores = await Score.find({ user: req.user._id })
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });
    res.send({ scores, scoreCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
