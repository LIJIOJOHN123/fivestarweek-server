const AppConstant = require("../config/appConstants");
const Premium = require("../model/PremiumSale");
const Score = require("../model/Score");
const User = require("../model/User");
var Insta = require("instamojo-nodejs");

exports.premiumPaymentInitialization = async (req, res) => {
  try {
    let { email, mobile, name, refer } = req.body;
    let newPremium = { email, name, mobile, refer };

    if (req.query.ref) {
      const user = await User.findOne({ userId: req.query.ref });
      newPremium.refer = req.query.ref;
      newPremium.referUser = user._id;
    }
    if (req.user) {
      newPremium.user = req.user._id;
      newPremium.registeredStatus = true;
    } else {
      newPremium.registeredStatus = false;
    }
    newPremium.status = AppConstant.PREMIUM_SELLER.NOT_PAID;
    newPremium.amount = parseInt(req.body.amount);
    newPremium.date = Date.now();
    if (req.body.type === 1) {
      newPremium.type = AppConstant.PREMIUM_USER_TYPE.UPGRADE;
      newPremium.oldPremiumType = req.body.oldPremiumType;
    }
    const newPlan = new Premium(newPremium);
    await newPlan.save();
    Insta.setKeys(process.env.PAYMENT_API_KEY, process.env.PAYMENT_AUTH_KEY);
    var data = new Insta.PaymentData();
    Insta.isSandboxMode(true);
    data.purpose = req.body.purpose;
    data.amount = req.body.amount;
    data.buyer_name = req.body.name;
    data.redirect_url = `${process.env.SERVER_URL}/callback/premiumsale/${newPlan._id}/${req.body.amount}`;
    data.email = req.body.email;
    data.phone = req.body.mobile;
    data.send_email = false;
    data.webhook = "https://www.fivestarweek.com/";
    data.send_sms = false;
    data.allow_repeated_payment = false;
    data.customer_id = newPlan._id;

    Insta.createPayment(data, async (error, response) => {
      if (error) {
        // some error
      } else {
        // Payment redirection link at response.payment_request.longurl

        const responseData = JSON.parse(response);
        const redirectUrl = responseData.payment_request.longurl;

        res.send(redirectUrl);
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
// seller can approve plan
exports.premuiumUserApprove = async (req, res) => {
  try {
    let buyer = await Premium.findOne({
      _id: req.params.id,
      referUser: req.user._id,
      status: AppConstant.PREMIUM_SELLER.APPROVED,
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
    buyer.status = AppConstant.PREMIUM_SELLER.NOT_PAID;
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
    res.send({ buyer });
  } catch (error) {
    res.status(500).send(error);
  }
};
// list user
exports.sellListBySeller = async (req, res) => {
  try {
    let buyers = await Premium.find({ _id: req.user._id });
    res.send({ buyers });
  } catch (error) {
    res.status(500).send(error);
  }
};

//call back
exports.paymentCallbackAPISell = async (req, res) => {
  try {
    console.log("premium");

    if (req.query.payment_id) {
      const premium = await Premium.findByIdAndUpdate({ _id: req.params.id });
      console.log(premium);
      if (req.query.payment_id === premium.premiumId) {
        return res
          .status(404)
          .send({ message: "Please verify your transaction" });
      }
      premium.premiumId = req.query.payment_id;
      premium.date = Date.now();
      premium.status = AppConstant.PREMIUM_SELLER.PENDING;

      var ses = require("node-ses"),
        client = ses.createClient({
          key: process.env.AWS_KEY,
          secret: process.env.AWS_SCECRET_KEY,
        });
      client.sendEmail(
        {
          cc: [`${premium.email}`],
          from: process.env.SESFROMMAIL,
          subject: "Premium user",
          message: `   <p>Hi ,</p> <br/>
          <h4>Congradulation! You have become premium user</h4>
          <br/>
          <p>Thank you so much for the subscription.</p>
          `,
          altText: "plain text",
        },
        function (err, data, res) {}
      );

      if (req.params.amount == "299") {
        premium.premiumType = AppConstant.PREMIUM_TYPE.SILVER;
      } else if (req.params.amount == "499") {
        premium.premiumType = AppConstant.PREMIUM_TYPE.GOLD;
      } else if (req.params.amount == "999") {
        premium.premiumType = AppConstant.PREMIUM_TYPE.DIAMOND;
      }
      await premium.save();

      // Redirect the user to payment complete page.
      return res.redirect(`${process.env.CLIENT_URL}/profile`);
    }
  } catch (error) {
    console.log(error);
  }
};
