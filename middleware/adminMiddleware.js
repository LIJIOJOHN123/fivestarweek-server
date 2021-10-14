const jwt = require("jsonwebtoken");
const User = require("../model/User");
const AppConstant = require("../config/appConstants");

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, AppConstant.JWT_VARIABLE);
    const user = await User.findOne({
      _id: decoded._id,
    });

    if (!user) {
      throw new Error();
    }
    if (user.isAd === false) {
      return res.status(401).send({ error: "You are not admin" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please autheticate" });
  }
};
module.exports = adminMiddleware;
