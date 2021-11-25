const AppConstant = require("../../config/appConstants");
const AcitivityHistory = require("../../model/ActivityHistory");
const Publisher = require("../../model/Publisher");

/**************************** Publisher ****************************************/

//Publisher Status Change
//publisher approve from admin
exports.publisher_block = async (req, res) => {
  try {
    const publisher = await Publisher.findById({ _id: req.params.id });
    publisher.status = AppConstant.PUBLISHER_STATUS.BLOCKED;
    await publisher.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} blocked this publisher.`,
      user: req.user._id,
      approved: req.user._id,
      type: "publisher managment",
    });
    await activity.save();
    res.send(publisher);
  } catch (error) {
    res.status(500).send(error);
  }
};
//Publisher Status Change
//publisher approve from admin
exports.publisher_unblock = async (req, res) => {
  try {
    const publisher = await Publisher.findById({ _id: req.params.id });
    publisher.status = AppConstant.PUBLISHER_STATUS.ACTIVE;
    await publisher.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} unblocked this publisher.`,
      user: req.user._id,
      approved: req.user._id,
      type: "publisher managment",
    });
    await activity.save();
    res.send(publisher);
  } catch (error) {
    res.status(500).send(error);
  }
};
//Publisher List
// get all publshers
exports.publisher_list = async (req, res) => {
  try {
    const publishers = await Publisher.find();
    const publisherCount = await Publisher.find().countDocuments();
    res.send({ publishers, publisherCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
