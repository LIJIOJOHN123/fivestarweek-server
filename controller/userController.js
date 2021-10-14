const bcrypt = require("bcryptjs");
const User = require("../model/User");
const appConstant = require("../config/appConstants");
const exportIdGenerator = require("../config/IDGenerator");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const Referal = require("../model/Referal");
const Language = require("../model/Language");
const Score = require("../model/Score");
const Channel = require("../model/Channel");
const Article = require("../model/Article");
const Comment = require("../model/Comment");
const Earning = require("../model/Earning");
const Notification = require("../model/Notification");
const Preference = require("../model/Preference");
const Country = require("../model/Country");
const State = require("../model/State");
const City = require("../model/City");
var Insta = require("instamojo-nodejs");
const moment = require("moment");
const Payment = require("../model/Payment");
const url = require("url");
const { PerformanceObserver } = require("perf_hooks");

/********************* Guest users  *******************/

//name:Registration
//desc: register as a user
//status:@public

exports.registartion = async (req, res) => {
  console.log(req.body);
  try {
    const user = new User(req.body);
    const email = await User.findOne({ email: req.body.email });
    if (email) {
      return res.status(400).send({
        message:
          "Your request register declined due to unspecified reason. Please try again",
      });
    }
    user.roles.push(appConstant.USER_ROLE.USER);
    user.name =
      req.body.name.toLowerCase().charAt(0).toUpperCase() +
      req.body.name.slice(1);
    user.userId = exportIdGenerator(20);
    randomNumber = Math.floor(Math.random() * (20000 * 30000));
    user.avatars.unshift({ image: process.env.PROFIE_AVATAR, zoom: "100%" });
    user.userName =
      req.body.name.toLowerCase().trim().replace(/\s/g, "") + randomNumber;
    await user.save();
    const token = await user.generateToken();
    res.cookie("token", token, { expiresIn: "1d" });
    if (req.query.refer !== "undefined") {
      const referlid = req.query.refer;
      const referOwner = await User.findOne({ userId: referlid });
      const ref = await Referal.findOne({ userId: referOwner._id });
      if (!ref) {
        let newRefer = {
          user: referOwner._id,
          referalLink: `${process.env.CLIENT_URL}/refer?king=${user.userId}`,
        };
        const newRefers = new Referal(newRefer);
        newRefers.usersRefered.unshift(user._id);
        await newRefers.save();
      } else {
        ref.usersRefered.unshift(user._id);
      }
    }
    let country = await Country.findOne({ country: req.body.country });
    if (!country) {
      const addList = new Country({ country: req.body.country });
      await addList.save();
      country = addList;
    }
    let state = await State.findOne({ state: req.body.region });
    if (!state) {
      const addList = new State({
        state: req.body.region,
        country: country._id,
      });
      await addList.save();
      state = addList;
    }
    let city = await City.findOne({ city: req.body.city });
    if (!city) {
      const addList = new City({
        country: country._id,
        city: req.body.city,
        state: state._id,
      });
      await addList.save();
      city = addList;
    }
    const language = await Language.findOne({ language: req.body.language });
    const prefer = new Preference({
      user: user._id,
      country: country._id,
      state: state._id,
      city: city._id,
      date: req.body.date,
      month: req.body.month,
      year: req.body.year,
      gender: req.body.gender,
      language: language._id,
    });
    if (country) {
      user.phoneCode = country.phoneCode;
      await user.save();
    }
    await prefer.save();
    const userScore = new Score({
      user: user._id,
      activity: "Registerd",
      description: `You have successfully registered with FiveStarWeek`,
      mode: "Credit",
      points: 100,
      totalScore: 100,
    });
    await userScore.save();

    const newpayment = {
      user: user._id,
      type: "Credit",
      description: "This amount will be used for account verification",
      amount: 1,
      status: true,
      balance: 1,
    };
    const payments = new Payment({
      description: "Registration bonus added",
      type: "Credit",
      amount: 5,
      user: user._id,
      balance: 5,
    });
    await payments.save();
    const newNotification = new Notification({
      receiveUser: user._id,
      message: `Welcome ${user.name} to FiveStarWeek family, Click here to read more welcome message`,
      type: "welcome",
      who: "FiveStarWeek",
      id: process.env.WELCOME_MESSAGE_LINK,
    });
    newNotification.what.push({ item: "no item" });
    newNotification.who.push({ item: "no item" });
    await newNotification.save();
    const earnings = new Earning(newpayment);
    await earnings.save();
    res
      .status(201)
      .send({ user, token, message: "You have successfully logged in!" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

//name:Login
//desc: login as a user
//status:@public

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .send({ message: "Please verify your email and password" });
    user.roles = user.roles.map((role) => role === appConstant.USER_ROLE.USER);
    if (user.status === appConstant.USER_STATUS.BLOCKED) {
      return res.status(400).send({
        message:
          "You account has been blocked due to suspecious activity. Please contact our team for further infomation.",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .send({ message: "Please verify your email and password" });
    const token = await user.generateToken();

    res.cookie("token", token, { expiresIn: "1d" });
    res
      .status(200)
      .send({ user, token, message: "You have successfully logged in!" });
  } catch (error) {
    res.status(500).send(error);
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = async (req, res) => {
  try {
    const idToken = req.body.tokenId;
    const response = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, name, email, jti, picture } = response.payload;
    if (email_verified) {
      const user = await User.findOne({ email });
      const userAvatar = {
        image: picture,
        zoom: "100%",
      };
      if (user) {
        user.avatar.image = picture;
        user.avatar.zoom = 100;
        user.avatars.unshift(userAvatar);
        user.registerStatus = false;
        await user.save();
        const token = await user.generateToken();
        res.cookie("token", token, { expiresIn: "1d" });
        return res.send({
          token,
          user,
          message: "You have successfully logged in!",
        });
      } else if (!user) {
        res.status(404).send({
          message:
            "You do not have acccount with us. Please go register page and create account",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Facebook login
//desc: Login with facebook
//status:@public

exports.facebookLogin = async (req, res) => {
  try {
    const {
      email,
      name,
      picture: {
        data: { url },
      },
    } = req.body;
    const user = await User.findOne({ email });
    const userAvatar = {
      image: url,
      zoom: "100%",
    };
    if (user) {
      (user.avatar.image = url), user.avatars.unshift(userAvatar);
      user.registerStatus = false;
      await user.save();
      const token = await user.generateToken();
      res.cookie("token", token, { expiresIn: "1d" });
      return res.send({
        token,
        user,
        message: "You have successfully logged in!",
      });
    } else {
      res.status(404).send({
        message:
          "You do not have acccount with us. Please go register page and create account",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Forgot password
//desc: forgot password
//status:@public

exports.forgotPassword = async (req, res) => {
  try {
    let email = req.body.email;
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .send({ message: "Sorry. This email does not exist" });
    }
    const token = await jwt.sign(
      { _id: user._id },
      process.env.JWT_RESET_PASSWORD,
      { expiresIn: "10m" }
    );

    user.resetPassword = token;
    await user.save();
    let link = `${process.env.CLIENT_URL}/resetpassword?token=${token}`;
    var ses = require("node-ses"),
      client = ses.createClient({
        key: process.env.AWS_KEY,
        secret: process.env.AWS_SCECRET_KEY,
      });

    client.sendEmail(
      {
        cc: [`${email}`],
        from: process.env.SESFROMMAIL,
        subject: "Forgot Password",
        message: `   <p>Hi ${user.name},</p> <br/>
          <h4>Please click <a href=${link}>Click here<a/> to reset your password</h4>
          <br/>
          <p>NB: This link expire after 10 minute.</p>
          `,
        altText: "plain text",
      },
      function (err, data, res) {
        // ...
      }
    );
    res.send({ message: "reset email has been sent successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Reset password
//desc: reset password
//status:@public

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (req.query.token) {
      const validToken = jwt.verify(
        req.query.token,
        process.env.JWT_RESET_PASSWORD
      );
      if (!validToken) {
        return res.status(404).send({ message: "Invalid! Please try again" });
      }
      const user = await User.findOne({ resetPassword: req.query.token });
      if (!user) {
        return res.status(404).send({ message: "Invalid! Please try again" });
      }
      user.password = password;
      await user.save();
      res.send(req.user);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

/********************* Loggedin users  *******************/

//name:Change email
//desc: change email
//status:@private

exports.changeEmail = async (req, res) => {
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

exports.channgePassword = async (req, res) => {
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

exports.getPublicProfile = async (req, res) => {
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
    const preference = await Preference.findOne({ user: req.user._id })
      .select(["-keyword", "-intersted", "-visited"])
      .populate(["country", "city", "state", "language"]);
    res.send({
      user,
      channelCount,
      commentCount,
      articleCount,
      earn,
      payment,
      score,
      preference,
    });
  } catch (error) {}
};

//name:Get user info
//desc: get use information after login
//status:@private

exports.getUserInfo = async (req, res) => {
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

exports.updateUserInfo = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "mobile",
    "phoneCode",
    "language",
    "date",
    "month",
    "year",
    "value",
  ];
  if (req.body.name) {
    userRealName =
      req.body.name.toLowerCase().charAt(0).toUpperCase() +
      req.body.name.slice(1);
  }
  console.log(req.body.value);
  let userLanguage;
  if (req.body.value) {
    const firstLag = await Language.findOne({ _id: req.body.value });
    userLanguage = firstLag.language;
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

exports.checkUserExist = async (req, res) => {
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

exports.logout = async (req, res) => {
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

exports.logoutAll = async (req, res) => {
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
exports.addProfileImage = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const profileAvatar = {
      image: req.file.location,
      zoom: req.body.zoom || 100,
    };
    user.avatars.unshift(profileAvatar);
    user.avatar.image = req.file.location;
    user.avatar.zoom = req.body.zoom;
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

//premuim user

exports.premuiumUser = async (req, res) => {
  try {
    Insta.setKeys(process.env.PAYMENT_API_KEY, process.env.PAYMENT_AUTH_KEY);
    var data = new Insta.PaymentData();
    Insta.isSandboxMode(true);
    data.purpose = req.body.purpose;
    data.amount = req.body.amount;
    data.buyer_name = req.user.name;
    data.redirect_url = req.body.redirect_url;
    data.email = req.user.email;
    data.phone = req.user.mobile;
    data.send_email = false;
    data.webhook = "https://www.youtube.com/";
    data.send_sms = false;
    data.allow_repeated_payment = false;
    data.customer_id = req.user._id;

    Insta.createPayment(data, async (error, response) => {
      console.log(response);
      if (error) {
        // some error
      } else {
        // Payment redirection link at response.payment_request.longurl
        const responseData = JSON.parse(response);
        req.user.isPremium = true;
        req.user.premiumDate = moment(Date.now()).format("MM/DD/YYYY");
        await req.user.save();
        const redirectUrl = responseData.payment_request.longurl;
        res.send(redirectUrl);
      }
    });
  } catch (error) {}
};

exports.paymentCallbackAPI = async (res, req) => {
  try {
    console.log(req.url);
    let url_parts = url.parse(req.url, true);
    console.log(url_parts);
    responseData = url_parts.query;
    if (responseData.payment_id) {
      console.log(req.params.id);
      const user = await User.findOneAndUpdate({ _id: req.params.id });
      user.isPremium = true;
      user.premiumDate = moment(Date.now()).format("MM/DD/YYYY");
      await user.save();
      // Redirect the user to payment complete page.
      return res.redirect("http://localhost:3000/profile");
    }
  } catch (error) {}
};
//email verification

exports.emailVerificationToken = async (req, res) => {
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
          <h4>Please click <a href="httldkjs">Click here<a/> to reset your password</h4>
          <br/>
          <p>${otp}.</p>
          `,
        altText: "plain text",
      },
      function (err, data, res) {
        console.log(data);
      }
    );
    await req.user.save();
    res.send({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.emailVerify = async (req, res) => {
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
    console.log(error);
    res.status(500).send(error);
  }
};
