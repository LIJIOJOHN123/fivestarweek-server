const Preference = require("../model/Preference");
const Article = require("../model/Article");

exports.adduserlocationpreference = async (req, res) => {
  try {
    const preference = await Preference.findOne({ user: req.user._id });
    if (!preference) {
      const newPrefernce = new Preference({ user: req.user._id });
      newPrefernce.gender = req.body.gender;
      newPrefernce.language = req.body.langauge;
      newPrefernce.dateOfBirth = req.body.dateOfBirth;
      newPrefernce.country = req.body.country;
      newPrefernce.state = req.body.region;
      newPrefernce.city = req.body.city;
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
      preference.city = req.body.city;
      //need to verify channel
      preference.intersted.unshift(req.body.channelKeyword);
      await preference.save();
      res.send(preference);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.userpreferencelist = async (req, res) => {
  try {
    const user = await Preference.findOne({ user: req.user._id });
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};
