const AppConstant = require("../../config/appConstants");
const User = require("../../model/User");
const Score = require("../../model/Score");
const Premium = require("../../model/PremiumSale");
const AcitivityHistory = require("../../model/ActivityHistory");

// seller
exports.premium_user_list = async (req, res) => {
  try {
    const premiumRequest = await Premium.find({})
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });
    res.send(premiumRequest);
  } catch (error) {
    res.status(500).send(error);
  }
};

//approve premium request
exports.premium_user_approve = async (req, res) => {
  try {
    let buyer = await Premium.findOne({
      _id: req.params.id,
      status: AppConstant.PREMIUM_SELLER.PENDING,
    });
    if (!buyer) {
      res.status(404).send({
        message:
          "Please wait for admin payment confirmation. If you do not hear from admin please message them with ID",
      });
    }
    const user = await User.find({ _id: buyer.user });
    if (!user) {
      res.status(404).send({
        message:
          "User have not registed. Please tell him/her to register account with us",
      });
    }
    buyer.registeredStatus = true;
    user.isPremium = true;
    user.premiumDate = Date.now();
    if (buyer.type === AppConstant.PREMIUM_USER_TYPE.NEW) {
      if (buyer.amount == 299) {
        const scorePrev = await Score.findOne({
          user: user._id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: user._id,
          activity: "Premium",
          description: `Congradulation- Added 350 points for choosing silver premium plan`,
          mode: "Credit",
          points: 350,
          totalScore: scorePrev === null ? 350 : scorePrev.totalScore + 350,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.SILVER;
      } else if (buyer.amount == 499) {
        user.isVerified = true;
        const scorePrev = await Score.findOne({
          user: user._id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: user._id,
          activity: "Premium",
          description: `Congradulation- Added 1000 points for choosing gold premium plan`,
          mode: "Credit",
          points: 1000,
          totalScore: scorePrev === null ? 100 : scorePrev.totalScore + 1000,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.GOLD;
      } else if (buyer.amount == 999) {
        user.isVerified = true;
        const scorePrev = await Score.findOne({
          user: user._id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: user._id,
          activity: "Premium",
          description: `Congradulation- Added 2500 points for choosing diamond premium plan`,
          mode: "Credit",
          points: 2500,
          totalScore: scorePrev === null ? 100 : scorePrev.totalScore + 2500,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.DIAMOND;
      }
    } else if (buyer.type === AppConstant.PREMIUM_USER_TYPE.UPGRADE) {
    }
    await buyer.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} confirmed that Fivestarweek.com received payment from them.`,
      user: req.user._id,
      approved: req.user._id,
      type: "premium_manager",
    });
    await activity.save();
    res.send({ buyer });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.premium_user_list_salesteam = async (req, res) => {
  try {
    const premiumRequest = await Premium.find({ refer: req.user._id }).sort({
      createdAt: -1,
    });
    res.send(premiumRequest);
  } catch (error) {
    res.status(500).send(error);
  }
};
