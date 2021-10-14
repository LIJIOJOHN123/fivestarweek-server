const Language = require("../model/Language");

exports.lanagaugelist = async (req, res) => {
  try {
    const languages = await Language.find();
    res.send(languages);
  } catch (error) {
    res.status(500).send(error);
  }
};
