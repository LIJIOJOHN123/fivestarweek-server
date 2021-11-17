const jwt = require("jsonwebtoken");
const User = require("../model/User");
const AppConstant = require("../config/appConstants");

const mixmiddleware = async (req, res, next) => {
  if (
    req.header("Authorization") &&
    req.header("Authorization") !== `Bearer ${undefined}`
  ) {
    let token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, AppConstant.JWT_VARIABLE);
    const user = await User.findOne({
      _id: decoded._id,
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } else {
    console.log("dasflkdaslk");
    next();
  }
};
module.exports = mixmiddleware;
