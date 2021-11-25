const AppConstant = require("../../config/appConstants");
const AcitivityHistory = require("../../model/ActivityHistory");
const Survey = require("../../model/Survey");

//survey list
exports.survey_list = async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    res.send(surveys);
  } catch (error) {
    res.status(500).send(error);
  }
};

//approve
exports.survey_approve = async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          status: AppConstant.SURVEY_STATUS.APPROVE,
        },
      }
    );
    const activity = new AcitivityHistory({
      action: `${req.user.name} approved this survey.`,
      user: req.user._id,
      approved: req.user._id,
      type: "survey_managment",
    });
    await activity.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//reject
exports.survey_reject = async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          status: AppConstant.SURVEY_STATUS.REJECT,
        },
      }
    );
    const activity = new AcitivityHistory({
      action: `${req.user.name} rejected this survey.`,
      user: req.user._id,
      approved: req.user._id,
      type: "survey_managment",
    });
    await activity.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//approve all surveys

exports.survey_approve_all_pending = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
    });
    let runs = await survey.result.filter(
      (item) => item.resultStatus == AppConstant.SURVEY_ANSWER_STATUS.PENDING
    );
    runs.map(
      (item) => (item.resultStatus = AppConstant.SURVEY_ANSWER_STATUS.APPROVE)
    );

    await survey.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//forced exit survey
exports.survey_forced_exit = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
    });
    survey.status = AppConstant.SURVEY_STATUS.COMPLETED;
    await survey.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} forced exit from this survey.`,
      user: req.user._id,
      approved: req.user._id,
      type: "survey_managment",
    });
    await activity.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};
