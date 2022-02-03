const bcrypt = require("bcryptjs");
const User = require("../../model/User");
const appConstant = require("../../config/appConstants");
const exportIdGenerator = require("../../config/IDGenerator");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const Referal = require("../../model/Referal");
const Score = require("../../model/Score");
const Earning = require("../../model/Earning");
const Notification = require("../../model/Notification");
const Preference = require("../../model/Preference");
const Payment = require("../../model/Payment");
const Language = require("../../model/Language");
//name:Registration
//desc: register as a user
//status:@public

exports.user_registartion = async (req, res) => {
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
    user.mobile = req.body.mobile;
    const token = await user.generateToken();
    user.language = req.body.language;
    res.cookie("token", token);
    if (req.query.refer !== "undefined") {
      const referlid = req.query.refer;
      const referOwner = await User.findOne({ userId: referlid });
      const ref = await Referal.findOne({ userId: referOwner._id });
      if (!ref) {
        let newRefer = {
          user: referOwner._id,
          referalLink: `${process.env.CLIENT_URL}/refer?refer=${user.userId}`,
        };
        const newRefers = new Referal(newRefer);
        newRefers.usersRefered.unshift(user._id);
        await newRefers.save();
      } else {
        ref.usersRefered.unshift(user._id);
      }
    }
    // let country;
    // if (req.body.country === "All" || req.body.country === undefined) {
    //   country = await Country.findOne({ country: "India" });
    // } else {
    //   country = await Country.findOne({ _id: req.body.country });
    // }
    // let state;
    // if (req.body.state === "All" || req.body.state === undefined) {
    //   state = await State.findOne({ state: "Karnataka" });
    // } else {
    //   state = await State.findOne({ _id: req.body.state });
    // }
    const prefer = new Preference({
      user: user._id,
      // country: country._id,
      // state: state._id,
      // date: req.body.date,
      // month: req.body.month,
      // year: req.body.year,
      // gender: req.body.gender,
      language: req.body.language,
    });

    // if (country) {
    //   user.phoneCode = country.phoneCode;
    //   await user.save();
    // }
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
    res.status(500).send(error);
  }
};

//name:Login
//desc: login as a user
//status:@public

exports.user_login = async (req, res) => {
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

    res.cookie("token", token);
    res
      .status(200)
      .send({ user, token, message: "You have successfully logged in!" });
  } catch (error) {
    res.status(500).send(error);
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.user_google_login = async (req, res) => {
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
        res.cookie("token", token);
        return res.send({
          token,
          user,
          message: "You have successfully logged in!",
        });
      } else if (!user) {
        const password = process.env.GOOGLE_PASSWORD;
        const user = new User({ email, name, password });
        user.roles.push(appConstant.USER_ROLE.USER);
        user.avatar = picture;
        user.language = req.body.language;
        user.avatars.unshift(userAvatar);
        randomNumber = Math.floor(Math.random() * (20000 * 30000));
        user.userName =
          name.toLowerCase().trim().replace(/\s/g, "") + randomNumber;
        const token = await user.generateToken();
        user.userId = exportIdGenerator(20);
        if (req.query.refer !== "undefined") {
          const referlid = req.query.refer;
          const refelOwner = await User.findOne({ userId: referlid });
          const ref = await Referal.findOne({ userId: refelOwner._id });
          ref.usersRefered.push(user._id);
          await ref.save();
        }
        const userScore = new Score({
          user: user._id,
          activity: "Registerd",
          description: `You have successfully registered with FiveStarWeek`,
          mode: "Credit",
          points: 100,
        });
        await userScore.save();
        res.cookie("token", token);

        res
          .status(201)
          .send({ user, token, message: "You have successfully logged in!" });
        await user.save();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Facebook login
//desc: Login with facebook
//status:@public

exports.user_facebook_login = async (req, res) => {
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
      await user.save();
      const token = await user.generateToken();
      res.cookie("token", token);
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

exports.user_forgot_password = async (req, res) => {
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
      { expiresIn: "1h" }
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
        subject: "FiveStarWeek password assistance",
        message: `   <p>Hi ${user.name},</p> <br/>
          <h4>Please click <button> <a href=${link}>Click here<a/></button> to reset your password</h4>
          <br/>
          <p>NB: This link expire after 10 minute.</p>
           <br/>
          <p>NB:Don't share  above link with anyone. Our customer service team will never ask you for your password, OTP, credit card, or banking info.</p>
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

exports.user_reset_password = async (req, res) => {
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
      const user = await User.findOne({ _id: validToken._id });
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

exports.master_admin_create = async (req, res) => {
  try {
    const userOne = await User.findOne({ email: "lijo@fivestarweek.com" });
    const token = await userOne.generateToken();
    userOne.isAd = true;
    userOne.roles.push(appConstant.USER_ROLE.ADMIN);
    await userOne.save();
    const userTwo = await User.findOne({ email: "lijojohnrbs@gmail.com" });
    const tokens = await userOne.generateToken();
    userTwo.isAd = true;
    userTwo.roles.push(appConstant.USER_ROLE.ADMIN);
    await userTwo.save();
    res.send({ userOne, token, userTwo, tokens });
  } catch (error) {
    res.status(500).send(error);
  }
};
