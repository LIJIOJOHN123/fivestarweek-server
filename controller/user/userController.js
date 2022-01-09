const bcrypt = require("bcryptjs");
const User = require("../../model/User");
const Language = require("../../model/Language");
const Score = require("../../model/Score");
const Channel = require("../../model/Channel");
const Article = require("../../model/Article");
const Comment = require("../../model/Comment");
const Earning = require("../../model/Earning");
const Preference = require("../../model/Preference");

var Insta = require("instamojo-nodejs");
const moment = require("moment");
const Payment = require("../../model/Payment");
const Survey = require("../../model/Survey");

const AppConstant = require("../../config/appConstants");
const ChannelSponsor = require("../../model/SponsorChannel");
const ArticleSponsor = require("../../model/SponsorArticle");
const PaytmChecksum = require("../../config/paytm");

/********************* Loggedin users  *******************/

//name:Change email
//desc: change email
//status:@private

exports.user_change_email = async (req, res) => {
  try {
    const match = req.user.email === req.body.oldEmail;
    if (!match) {
      return res.status(400).send({ message: "Please verify email" });
    }
    const isMatch = await bcrypt.compare(req.body.password, req.user.password);
    if (!isMatch)
      return res
        .status(400)
        .send({ message: "Please verify your email and password" });
    req.user.email = req.body.newEmail;
    await req.user.save();
    res.send(req.user);
  } catch (error) {}
};
//name:Change password
//desc: change password
//status:@private

exports.user_change_password = async (req, res) => {
  try {
    const match = req.user.email === req.body.email;
    if (!match) {
      return res.status(400).send({ message: "Please verify email" });
    }
    const isMatch = await bcrypt.compare(
      req.body.oldPassword,
      req.user.password
    );
    if (!isMatch)
      return res
        .status(400)
        .send({ message: "Please verify your email and password" });
    req.user.password = req.body.newPassword;
    await req.user.save();
    res.send(req.user);
  } catch (error) {}
};

//name:Public profile
//desc: public profile
//status:@public

exports.user_get_intro_profile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select({
      name: 1,
      userName: 1,
      avatar: 1,
      name: 1,
    });
    const channelCount = await Channel.find({
      user: user._id,
    }).countDocuments();
    const commentCount = await Comment.find({
      user: user._id,
    }).countDocuments();
    const articleCount = await Article.find({
      user: user._id,
    }).countDocuments();
    const earn = await Earning.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    const payment = await Payment.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    const score = await Score.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    const commentsCount = await Comment.find({
      user: user._id,
    }).countDocuments();
    const surveyCount = await Survey.find({
      user: user._id,
    }).countDocuments();
    const channelAdCount = await ChannelSponsor.find({
      user: user._id,
    }).countDocuments();
    const articleAdCount = await ArticleSponsor.find({
      user: user._id,
    }).countDocuments();
    const preference = await Preference.findOne({ user: req.user._id })
      .select(["-keyword", "-intersted", "-visited"])
      .populate(["country", "state", "language"]);
    res.send({
      user,
      channelCount,
      surveyCount,
      commentCount,
      channelAdCount,
      articleAdCount,
      articleCount,
      earn,
      payment,
      score,
      preference,
      commentsCount,
    });
  } catch (error) {}
};

//name:Get user info
//desc: get use information after login
//status:@private

exports.user_info_auth = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Edit user infor
//desc: edit user information after login
//status:@private

exports.user_update = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "mobile", "phoneCode", "language", "value"];
  if (req.body.name) {
    userRealName =
      req.body.name.toLowerCase().charAt(0).toUpperCase() +
      req.body.name.slice(1);
  }
  let userLanguage;
  if (req.body.value) {
    // const firstLag = await Language.findOne({ _id: req.body.value });
    userLanguage = req.body.value;
  }
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send("Invalid udpate");
  }

  try {
    await updates.map((update) => (req.user[update] = req.body[update]));
    if (req.body.value) {
      req.user.language = userLanguage;
      (req.user.registerStatus = false), (req.user.languageId = req.body.value);
    }
    const prefer = await Preference.findOne({ user: req.user._id });
    prefer.language = req.body.value;
    await prefer.save();
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:check username
//desc: check existiong usernames and throw error if username exists
//status:@private

exports.user_username_exist_check = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.oldusername });
    if (user.userName != req.user.userName) {
      return res.status(404).send({ message: "Please check your username" });
    }
    let usernames = req.body.newusername
      .toLowerCase()
      .trim()
      .replace(/\s/g, "");
    const userexist = await User.findOne({ userName: usernames });
    if (userexist) {
      return res.status(404).send({ message: "username already exist" });
    }
    req.user.userName = usernames;

    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
};
//name:singout
//desc: signout user
//status:@private

exports.user_logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.clearCookie("token");
    res.send({ message: "Logout sucessfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:singout all
//desc: signout all session
//status:@private

exports.user_logout_all = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.clearCookie("token");
    res.send({ message: "Logout sucessfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Edit Avatar
//desc: change avatar
//status:@private
exports.user_add_avatar = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const profileAvatar = {
      image: req.file.location,
      zoom: req.query.zoom || "100%",
    };
    user.avatars.unshift(profileAvatar);
    user.avatar.image = req.file.location;
    user.avatar.zoom = req.query.zoom;
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

//premuim user

exports.user_become_premium_user = async (req, res) => {
  try {
    Insta.setKeys(process.env.PAYMENT_API_KEY, process.env.PAYMENT_AUTH_KEY);
    var data = new Insta.PaymentData();
    Insta.isSandboxMode(true);
    data.purpose = req.body.purpose;
    data.amount = req.body.amount;
    data.buyer_name = req.user.name;
    data.redirect_url = `${process.env.SERVER_URL}/callback/premium/${req.user._id}/${req.body.amount}`;
    data.email = req.user.email;
    data.phone = req.user.mobile;
    data.send_email = false;
    data.webhook = "https://www.fivestarweek.com/";
    data.send_sms = false;
    data.allow_repeated_payment = false;
    data.customer_id = req.user._id;

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
  } catch (error) {}
};

exports.user_premium_callback_api = async (req, res) => {
  try {
    if (req.query.payment_id) {
      const user = await User.findByIdAndUpdate({ _id: req.params.id });

      if (req.query.payment_id === user.premiumId) {
        return res
          .status(404)
          .send({ message: "Please verify your transaction" });
      }
      user.premiumId = req.query.payment_id;
      user.isPremium = true;
      user.premiumDate = moment(Date.now()).format("MM/DD/YYYY");

      var ses = require("node-ses"),
        client = ses.createClient({
          key: process.env.AWS_KEY,
          secret: process.env.AWS_SCECRET_KEY,
        });
      client.sendEmail(
        {
          cc: [`${user.email}`],
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
        const scorePrev = await Score.findOne({
          user: req.params.id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: req.params.id,
          activity: "Premium",
          description: `Congradulation- Added 350 points for choosing silver premium plan`,
          mode: "Credit",
          points: 350,
          totalScore: scorePrev === null ? 350 : scorePrev.totalScore + 350,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.SILVER;
      } else if (req.params.amount == "499") {
        user.isVerified = true;
        const scorePrev = await Score.findOne({
          user: req.params.id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: req.params.id,
          activity: "Premium",
          description: `Congradulation- Added 1000 points for choosing gold premium plan`,
          mode: "Credit",
          points: 1000,
          totalScore: scorePrev === null ? 100 : scorePrev.totalScore + 1000,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.GOLD;
      } else if (req.params.amount == "999") {
        user.isVerified = true;
        const scorePrev = await Score.findOne({
          user: req.params.id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: req.params.id,
          activity: "Premium",
          description: `Congradulation- Added 2500 points for choosing diamond premium plan`,
          mode: "Credit",
          points: 2500,
          totalScore: scorePrev === null ? 100 : scorePrev.totalScore + 2500,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.DIAMOND;
      }
      await user.save();

      // Redirect the user to payment complete page.
      return res.redirect(`${process.env.CLIENT_URL}/profile`);
    }
  } catch (error) {}
};
//email verification

exports.user_email_verification_request = async (req, res) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    req.user.emailOTP = otp;
    var ses = require("node-ses"),
      client = ses.createClient({
        key: process.env.AWS_KEY,
        secret: process.env.AWS_SCECRET_KEY,
      });
    client.sendEmail(
      {
        cc: [`${req.user.email}`],
        from: process.env.SESFROMMAIL,
        subject: "OTP Verfication",
        message: `   <p>Hi ,</p> <br/>
          <p>${otp}.</p> </br>
          <br/>
          <br/>
          <p>Do not share your OTP with anyone including Fivestarweek staff</p>
          <br/>
          <br/>
          <p>For any OTP related query please email us at info@fivestarweek.com</p>
          <br/>
          <p>Regards,</p>
          <br/>
          <p>Fivestarweek team</p>
          `,
        altText: "plain text",
      },
      function (err, data, res) {}
    );
    await req.user.save();
    res.send({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.user_email_verify = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
      isEmailVerified: false,
    });
    if (user.emailOTP == req.body.otp) {
      user.isEmailVerified = true;
      const scorePrev = await Score.findOne({ user: user._id }).sort({
        createdAt: -1,
      });
      const userScore = new Score({
        user: user._id,
        activity: "Email verfication",
        description: `You have successfully verifiedy email address`,
        mode: "Credit",
        points: 30,
        totalScore: scorePrev.totalScore + 30,
      });
      await userScore.save();
    } else {
      return res.status(404).send("Please check your otp and try again");
    }
    await user.save();
    res.send({ message: "Your email has been verified successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

//testing paytm
exports.user_become_premium_user_paytm = async (req, res) => {
  try {
    var paymentDetails = {
      amount: req.user.amount,
      customerId: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
    };

    var params = {};
    params["MID"] = process.env.PAYTM_MERCHANT_ID;
    params["WEBSITE"] = process.env.PAYTM_MERCHANT_WEBSITE;
    params["CHANNEL_ID"] = "WEB";
    params["INDUSTRY_TYPE_ID"] = "Retail";
    params["ORDER_ID"] = "TEST_" + new Date().getTime();
    params["CUST_ID"] = req.user._id;
    params["TXN_AMOUNT"] = req.body.amount;
    params[
      "CALLBACK_URL"
    ] = `${process.env.SERVER_URL}/callback/premium/paytm${req.user._id}/${req.body.amount}`;
    params["EMAIL"] = req.user.email;
    params["MOBILE_NO"] = req.user.mobile;
    var paytmChecksum = PaytmChecksum.generateSignature(
      params,
      process.env.PAYTM_MERCHANT_KEY
    );
    paytmChecksum
      .then(function (result) {
        var verifyChecksum = PaytmChecksum.verifySignature(
          paytmParams,
          "YOUR_MERCHANT_KEY",
          result
        );
        console.log("verifySignature Returns: " + verifyChecksum);
      })
      .catch(function (error) {
        console.log(error);
      });
    // paytmChecksum
    //   .then(function (checksum) {
    //     console.log(checksum);
    //     let paytmParams = {
    //       ...params,
    //       CHECKSUMHASH: checksum,
    //     };
    //     console.log(paytmParams);
    //     res.json(paytmParams);

    //     res.json(paytmParams);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
  } catch (error) {
    console.log(error);
  }
};

exports.user_premium_callback_api = async (req, res) => {
  try {
    if (req.query.payment_id) {
      const user = await User.findByIdAndUpdate({ _id: req.params.id });

      if (req.query.payment_id === user.premiumId) {
        return res
          .status(404)
          .send({ message: "Please verify your transaction" });
      }
      user.premiumId = req.query.payment_id;
      user.isPremium = true;
      user.premiumDate = moment(Date.now()).format("MM/DD/YYYY");

      var ses = require("node-ses"),
        client = ses.createClient({
          key: process.env.AWS_KEY,
          secret: process.env.AWS_SCECRET_KEY,
        });
      client.sendEmail(
        {
          cc: [`${user.email}`],
          from: process.env.SESFROMMAIL,
          subject: "Premium user",
          message: `   <p>Hi ,</p> <br/>
          <h4>Congradulation! You have become premium user</h4>
          <br/>
          <p>Thank you so much for the subscription.</p>
          <br/>
          <br/>
          <p>Regards,</p>
          <br/>
          <p>Fivestarweek team</p>
          `,
          altText: "plain text",
        },
        function (err, data, res) {}
      );

      if (req.params.amount == "299") {
        const scorePrev = await Score.findOne({
          user: req.params.id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: req.params.id,
          activity: "Premium",
          description: `Congradulation- Added 350 points for choosing silver premium plan`,
          mode: "Credit",
          points: 350,
          totalScore: scorePrev === null ? 350 : scorePrev.totalScore + 350,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.SILVER;
      } else if (req.params.amount == "499") {
        user.isVerified = true;
        const scorePrev = await Score.findOne({
          user: req.params.id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: req.params.id,
          activity: "Premium",
          description: `Congradulation- Added 1000 points for choosing gold premium plan`,
          mode: "Credit",
          points: 1000,
          totalScore: scorePrev === null ? 100 : scorePrev.totalScore + 1000,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.GOLD;
      } else if (req.params.amount == "999") {
        user.isVerified = true;
        const scorePrev = await Score.findOne({
          user: req.params.id,
        }).sort({
          createdAt: -1,
        });
        const userScore = new Score({
          user: req.params.id,
          activity: "Premium",
          description: `Congradulation- Added 2500 points for choosing diamond premium plan`,
          mode: "Credit",
          points: 2500,
          totalScore: scorePrev === null ? 100 : scorePrev.totalScore + 2500,
        });
        await userScore.save();
        user.premiumType = AppConstant.PREMIUM_TYPE.DIAMOND;
      }
      await user.save();

      // Redirect the user to payment complete page.
      return res.redirect(`${process.env.CLIENT_URL}/profile`);
    }
  } catch (error) {}
};
