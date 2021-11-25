const jwt = require("jsonwebtoken");
const User = require("../model/User");
const AppConstant = require("../config/appConstants");

const department_middleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, AppConstant.JWT_VARIABLE);
    const user = await User.findOne({
      _id: decoded._id,
    });

    if (!user) {
      throw new Error();
    }
    const team = await Team.findOne({ user: user._id });
    let authorize = team.tasks.find((item) => item === req.query.taskid);

    if (!authorize) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please autheticate" });
  }
};
module.exports = department_middleware;
