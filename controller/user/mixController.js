const Language = require("../../model/Language");
const Country = require("../../model/Country");
const State = require("../../model/State");
const Bank = require("../../model/Bank");
const Earning = require("../../model/Earning");
const AppConstant = require("../../config/appConstants");
const Notification = require("../../model/Notification");
const Payment = require("../../model/Payment");
var Insta = require("instamojo-nodejs");
const Score = require("../../model/Score");
const Comment = require("../../model/Comment");
const Premium = require("../../model/PremiumSale");
const Article = require("../../model/Article");
const Channel = require("../../model/Channel");
const Search = require("../../model/Search");
const Preference = require("../../model/Preference");
const MarketingEmail = require("../../model/MarketingEmail");
const Referal = require("../../model/Referal");
const User = require("../../model/User");
exports.country_list = async (req, res) => {
  try {
    const country = await Country.find();
    res.send({ country });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.state_list = async (req, res) => {
  try {
    const country = await Country.findOne({ _id: req.params.id });
    const state = await State.find({ country: req.params.id });
    res.send({ country, state });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.lanagauge_list = async (req, res) => {
  try {
    const languages = await Language.find();
    res.send(languages);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.earnings_add_bank_account = async (req, res) => {
  try {
    const bankaccount = new Bank({
      user: req.user._id,
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      IFSC: req.body.IFSC,
      accountHolderName: req.body.accountHolderName,
      UPI: req.body.UPI,
      payPal: req.body.payPal,
      preference: req.body.preference,
    });
    await bankaccount.save();
    res.send(bankaccount);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.earnings_list = async (req, res) => {
  try {
    const earningCount = await Earning.find({
      user: req.user._id,
    }).countDocuments();
    const earnings = await Earning.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    const bank = await Bank.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.send({ earnings, bank, earningCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.earning_withdraw = async (req, res) => {
  try {
    const earn = await Earning.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (parseInt(req.body.amount) > parseInt(earn.balance)) {
      return res.status(404).send({ message: "Please check your balance" });
    }
    const newpayment = {
      user: req.user._id,
      type: "Debit",
      description: req.body.description,
      amount: req.body.amount,
      status: false,
      balance: earn.balance - parseInt(req.body.amount),
    };
    const newEarn = new Earning(newpayment);
    var ses = require("node-ses"),
      client = ses.createClient({
        key: process.env.AWS_KEY,
        secret: process.env.AWS_SCECRET_KEY,
      });

    client.sendEmail(
      {
        cc: [`${email}`],
        from: process.env.SESFROMMAIL,
        subject: "FiveStarWeek withdrawal",
        message: `   <p>Hi ${user.name},</p> <br/>
          <h4>Withawal request</h4>
          <br/>
          <p>We would like to inform your that we have recieved your withdrwal request. Your request will be processed soon.</p>
          `,
        altText: "plain text",
      },
      function (err, data, res) {
        // ...
      }
    );
    await newEarn.save();
    res.send(newEarn);
  } catch (error) {
    res.status(500).send(error);
  }
};

//notificatoin

exports.notification_list = async (req, res) => {
  try {
    const notificationCount = await Notification.find({
      receiveUser: req.user._id,
    }).countDocuments();
    const notificationUnread = await Notification.find({
      receiveUser: req.user._id,
      readStatus: AppConstant.NOTFICATION.UNREAD,
    }).countDocuments();

    const notifications = await Notification.find({ receiveUser: req.user._id })
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });
    res.send({ notifications, notificationCount, notificationUnread });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.notification_read = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id });
    notification.readStatus = AppConstant.NOTFICATION.READ;
    notification.save();
    res.send(notification);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.notification_read_all = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiveUser: req.user._id,
    });
    notifications.map(async (item) => {
      item.readStatus = AppConstant.NOTFICATION.READ;
      await item.save();
    });
    res.send(notifications);
  } catch (error) {
    res.status(500).send(error);
  }
};
//score

exports.score_list_user = async (req, res) => {
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

//payment

exports.payment_list = async (req, res) => {
  try {
    const payment = await Payment.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).send({ payment });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.payment_add = async (req, res) => {
  try {
    Insta.setKeys(process.env.PAYMENT_API_KEY, process.env.PAYMENT_AUTH_KEY);
    var data = new Insta.PaymentData();
    Insta.isSandboxMode(true);
    data.purpose = req.body.purpose;
    data.amount = req.body.amount;
    data.buyer_name = req.user.name;
    data.redirect_url = `${process.env.SERVER_URL}/callback/payment/${req.user._id}/${req.body.amount}`;
    data.email = req.user.email;
    data.phone = req.user.mobile;
    data.send_email = false;
    data.webhook = "https://www.youtube.com/";
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
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.payment_add_callback_api = async (req, res) => {
  try {
    if (req.query.payment_id) {
      const payment = new Payment({
        description: "Amount is added to account",
        type: "Credit",
        amount: parseInt(req.params.amount),
        user: req.params.id,
        payId: req.query.payment_id,
      });
      const duplicate = await Payment.findOne({ payId: req.query.payment_id });
      if (duplicate) {
        return res
          .status(404)
          .send({ message: "Please verify your transaction" });
      }
      const paymentLast = await Payment.findOne({
        user: req.params.id,
      }).sort({ createdAt: -1 });
      payment.balance =
        parseInt(paymentLast.balance) + parseInt(req.params.amount);
      await payment.save();

      // Redirect the user to payment complete page.
      return res.redirect(`${process.env.CLIENT_URL}/payment`);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Search result
//desc: filter search result
//status:@public

exports.search = async (req, res) => {
  let search = req.query.key;
  //article
  let limit = req.query.limit;
  //video
  let limits = req.query.limits;
  //channel
  let limited = req.query.limited;
  //comment
  let limiting = req.query.limiting;
  let searchkey = req.query.key.toLowerCase();

  if (req.user) {
    const pref = await Preference.findOne({ user: req.user._id });
    if (!pref) {
      const search = new Preference({ user: req.user._id });

      search.keyword.unshift({ keyword: searchkey });
      await search.save();
    }
    const keywords = await Preference.findOne({ "keyword.keyword": searchkey });
    if (keywords) {
      await keywords.keyword.map((key) =>
        key.keyword === searchkey ? (key.occurance = key.occurance + 1) : key
      );
      await keywords.save();
    } else {
      pref.keyword.unshift({ keyword: searchkey });
    }
    await pref.save();
  }

  let key = new Search({ keyword: searchkey });
  if (req.user) {
    key.visit.push({ user: req.user._id });
  }
  await key.save();

  try {
    // article
    let articlesCount = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    let article = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    })
      .populate(["channel", "user"])
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    // video

    let videosCount = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Video",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    let video = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Video",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { kewords: { $regex: search, $options: "i" } },
      ],
    })
      .populate(["channel", "user"])
      .limit(parseInt(limits))
      .sort({ createdAt: -1 });
    // COMMENT
    let commentsCount = await Comment.find({
      status: AppConstant.COMMENT_STATUS.ACTIVE,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    let comment = await Comment.find({
      status: AppConstant.COMMENT_STATUS.ACTIVE,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ],
    })
      .populate(["user", "channel", "article"])
      .limit(parseInt(limiting))
      .sort({ createdAt: -1 });
    //channel
    let channelsCount = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
      $or: [
        { channel: { $regex: search, $options: "i" } },
        { channelName: { $regex: search, $options: "i" } },
        { introduction: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    let channel = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
      $or: [
        { channel: { $regex: search, $options: "i" } },
        { channelName: { $regex: search, $options: "i" } },
        { introduction: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ],
    })
      .populate("user")
      .limit(parseInt(limited))
      .sort({ createdAt: -1 });
    res.send({
      article,
      video,
      channel,
      comment,
      articlesCount,
      videosCount,
      channelsCount,
      commentsCount,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Pre search
//desc: filter pre-search result
//status:@public

exports.presearch = async (req, res) => {
  try {
    const channels = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
      verifiedStatus: AppConstant.CHANNEL_VERIFICATION.VERIFIED,
    })
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(18);
    let channeOnline = channels.map((item) => item._id);
    const articles = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Article",
      channel: channeOnline,
    })
      .populate(["channel", "user"])
      .sort({ createdAt: 1 })
      .limit(20);
    const videos = await Article.find({
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
      type: "Video",
    })
      .populate(["channel", "user"])
      .sort({ createdAt: 1 })
      .limit(20);
    const comments = await Comment.find({
      status: AppConstant.COMMENT_STATUS.ACTIVE,
    })
      .populate(["article", "user", "channel"])
      .sort({ createdAt: -1 })
      .limit(21);
    res.send({ articles, videos, channels, comments });
  } catch (error) {
    res.status(500).send(error);
  }
};

//refer

exports.refer_link = async (req, res) => {
  try {
    const refer = await Referal.findOne({ userId: req.user._id });
    const users = await User.find({ _id: refer.usersRefered }).select({
      name: 1,
      _id: 1,
      email: 1,
      userName: 1,
    });
    res.send({ refer, users });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.send_marketing_emails = async (req, res) => {
  try {
    const newEmail = req.body.email.split(",");
    newEmail.map(async (item) => {
      const newItem = {
        email: item,
        user: req.user._id,
      };
      const newEmails = new MarketingEmail(newItem);
      await newEmails.save();
      var ses = require("node-ses"),
        client = ses.createClient({
          key: process.env.AWS_KEY,
          secret: process.env.AWS_SCECRET_KEY,
        });
      client.sendEmail(
        {
          cc: [`${item}`],
          from: process.env.SESFROMMAIL,
          subject: "FIVE Star week invitation",
          message: `   <p>Hi ,</p> <br/>
          <h4>Please click <a href="httldkjs">Click here<a/> to reset your password</h4>
          <br/>
          <p>NB: This link expire after 10 minute.</p>
          `,
          altText: "plain text",
        },
        function (err, data, res) {}
      );
    });
    res.send({ message: "send successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.refer_user_details = async (req, res) => {
  try {
    const refers = await Referal.find().sort({ createdAt: -1 }).limit(1);
    let refer;
    if (req.query.user != undefined) {
      refer = await Referal.findOne({ userId: req.query.user });
    }

    res.send({ refer, refers });
  } catch (error) {
    res.status(500).send(error);
  }
};

//preference

exports.user_qualification_filter_details = async (req, res) => {
  try {
    const preference = await Preference.findOne({ user: req.user._id });
    if (!preference) {
      const newPrefernce = new Preference({ user: req.user._id });
      newPrefernce.gender = req.body.gender;
      newPrefernce.language = req.body.langauge;
      newPrefernce.dateOfBirth = req.body.dateOfBirth;
      newPrefernce.country = req.body.country;
      newPrefernce.state = req.body.region;
      //need to verify channels
      newPrefernce.intersted.unshift(req.body.channelKeyword);
      await newPrefernce.save();
      res.send(newPrefernce);
    } else {
      preference.gender = req.body.gender;
      preference.language = req.body.langauge;
      preference.dateOfBirth = req.body.dateOfBirth;
      preference.country = req.body.country;
      preference.state = req.body.region;
      //need to verify channel
      preference.intersted.unshift(req.body.channelKeyword);
      await preference.save();
      res.send(preference);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.user_qaulfication_by_id = async (req, res) => {
  try {
    const user = await Preference.findOne({ user: req.user._id });
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.premium_initilization = async (req, res) => {
  try {
    let { email, mobile, name, refer } = req.body;
    let newPremium = { email, name, mobile, refer };

    if (req.body.refer) {
      const users = await User.findOne({ userId: req.body.refer });
      newPremium.refer = req.body.refer;
      newPremium.referUser = users._id;
    }
    if (req.user) {
      newPremium.user = req.user._id;
      newPremium.registeredStatus = true;
    }
    newPremium.registeredStatus = false;

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

//call back
exports.premium_callback_api = async (req, res) => {
  try {
    if (req.query.payment_id) {
      const premium = await Premium.findByIdAndUpdate({ _id: req.params.id });
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
