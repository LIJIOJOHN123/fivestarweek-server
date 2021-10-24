const MarketingEmail = require("../model/MarketingEmail");
const Referal = require("../model/Referal");
const User = require("../model/User");

exports.generateReferalLink = async (req, res) => {
  const articleMessage =
    "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.";
  const titleMessage = "Where can I get some?";
  try {
    const user = await User.findOne({ _id: req.user._id });
    const link = `${process.env.CLIENT_URL}/refer?king=${user.userId}`;
    const ref = new Referal({
      userId: req.user.userId,
      referalLink: link,
      title: titleMessage,
      description: articleMessage,
      image: process.env.INVITATION_IMAGE,
    });
    await ref.save();
    res.send(ref);
  } catch (error) {
    res.status(500).error();
  }
};

exports.getReferalLink = async (req, res) => {
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

exports.getEmail = async (req, res) => {
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

exports.getLinkDetails = async (req, res) => {
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
