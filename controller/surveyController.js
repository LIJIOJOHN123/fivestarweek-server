const AppConstant = require("../config/appConstants");
const Payment = require("../model/Payment");
const Survey = require("../model/Survey");
const jwt = require("jsonwebtoken");
const Earning = require("../model/Earning");
const Country = require("../model/Country");
const State = require("../model/State");
const City = require("../model/City");
const Language = require("../model/Language");
const Preference = require("../model/Preference");
exports.createSurvey = async (req, res) => {
  let countrySelect;
  if (req.body.country === "All") {
    let countryAlone = await Country.findOne({ country: "All" });
    countrySelect = countryAlone._id;
  } else {
    countrySelect = req.body.country;
  }
  let stateSelect;
  if (req.body.state === "All") {
    const stateAlone = await State.findOne({ state: "All" });
    stateSelect = stateAlone._id;
  } else {
    stateSelect = req.body.state;
  }
  let citySelect;
  if (req.body.city === "All") {
    const cityAlone = await City.findOne({ city: "All" });
    citySelect = cityAlone._id;
  } else {
    citySelect = req.body.city;
  }
  let languageSelect;
  if (req.body.language === "All") {
    const languageAlone = await Language.findOne({ language: "English" });
    languageSelect = languageAlone._id;
  } else {
    languageSelect = req.body.language;
  }
  try {
    const newSurvey = {
      user: req.user._id,
      title: req.body.title,
      description: req.body.description,
      surveyLink: req.body.surveyLink,
      participants: req.body.participants,
      gender: req.body.gender,
      country: countrySelect,
      state: stateSelect,
      language: languageSelect,
      city: citySelect,
      perSurveyPrice: req.body.perSurveyPrice,
      total: parseInt(req.body.total),
      ageFrom: req.body.ageFrom,
      ageTo: req.body.ageTo,
      fee: parseInt(req.body.fee),
      grandTotal: parseInt(req.body.grandTotal),
      instruction: req.body.instruction,
    };
    const survey = new Survey(newSurvey);
    const payList = await Payment.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const payment = new Payment({
      description: req.body.description,
      type: "Debit",
      amount: req.body.total,
      user: req.user._id,
    });
    if (payList.balance < 0) {
      return res
        .status(404)
        .send({ message: "You do nave enough balance in your account." });
    }
    payment.balance = payList.balance - req.body.total;
    survey.status = AppConstant.SURVEY_STATUS_PENDING;
    await payment.save();
    await survey.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.userSurveyList = async (req, res) => {
  try {
    const lists = await Survey.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });
    let surveys = lists.filter(
      (item) => item.status !== AppConstant.SURVEY_STATUS.BLOCK
    );
    res.send(surveys);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      user: req.user._id,
      _id: req.params.id,
    });
    survey.status = AppConstant.SURVEY_STATUS.BLOCK;
    await survey.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//survey approve
exports.userSurveyApprove = async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      {
        user: req.user._id,
        _id: req.params.id,
        "result._id": req.params.result,
      },
      {
        $set: {
          "result.$.resultStatus": AppConstant.SURVEY_ANSWER_STATUS.APPROVE,
        },
      }
    );
    let status = survey.result.filter(
      (item) => item._id.toString() === req.params.result.toString()
    );
    const earn = await Earning.findOne({ user: status[0].user }).sort({
      createdAt: -1,
    });
    let totals = parseInt(earn.balance) + parseInt(survey.perSurveyPrice);
    const newpayment = {
      user: status[0].user,
      type: "Credit",
      description: `survey was approved. survey is - ${survey.title}`,
      amount: survey.perSurveyPrice,
      status: true,
      balance: totals,
    };
    const earnings = new Earning(newpayment);
    await earnings.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};
//reject
//survey approve
exports.userSurveyReject = async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      {
        user: req.user._id,
        _id: req.params.id,
        "result._id": req.params.result,
      },
      {
        $set: {
          "result.$.resultStatus": AppConstant.SURVEY_ANSWER_STATUS.REJECT,
        },
      }
    );
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//user survey by id
exports.surveyByIdCreatedUser = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate(["country", "city", "state", "language"]);
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.surveyByIdEndUser = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
    }).populate(["country", "city", "state", "language"]);
    const preference = await Preference.findOne({ user: req.user._id })
      .select(["-keyword", "-intersted", "-visited"])
      .populate(["country", "city", "state", "language"]);
    res.send({ survey, preference });
  } catch (error) {
    res.status(500).send(error);
  }
};
//survey accept
//survey responsoe
exports.surveyAccept = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
    }).populate(["country", "city", "state", "language"]);
    const preference = await Preference.findOne({ user: req.user._id })
      .select(["-keyword", "-intersted", "-visited"])
      .populate(["country", "city", "state", "language"]);
    if (survey.country.country !== "All") {
      if (survey.country.toString() !== preference.country.toString()) {
        return res
          .status(404)
          .send({ message: "You do not meet survey qualification criteria." });
      }
    }
    if (survey.state.state !== "All") {
      if (survey.state.toString() !== preference.state.toString()) {
        return res
          .status(404)
          .send({ message: "You do not meet survey qualification criteria." });
      }
    }
    if (survey.city.city !== "All") {
      if (survey.city.toString() !== preference.city.toString()) {
        return res.status(404).send({
          message: "You do not meet survey qualification criteria.",
        });
      }
    }
    if (survey.language.language !== "English") {
      if (survey.language.toString() !== preference.language.toString()) {
        return res.status(404).send({
          message: "You do not meet survey qualification criteria.",
        });
      }
    }
    if (survey.gender !== "All") {
      if (survey.gender.toString() !== preference.gender.toString()) {
        return res.status(404).send({
          message: "You do not meet survey qualification criteria.",
        });
      }
    }
    const currentDate = new Date();
    const userAge = parseInt(currentDate.getFullYear() - preference.year);
    if (survey.ageFrom >= userAge || survey.ageTo <= userAge) {
      return res.status(404).send({
        message: "You do not meet survey qualification criteria.",
      });
    }
    let surveyinprogress = await survey.result.filter(
      (item) => item.surveyStatus === AppConstant.SURVEY_RESULT_STATUS.ACCEPT
    );
    let surveyComplted = await survey.result.filter(
      (item) => item.surveyStatus === AppConstant.SURVEY_RESULT_STATUS.SUBMIT
    );
    let surveyCurrentAnswer = surveyinprogress.length + surveyComplted.length;
    console.log(surveyCurrentAnswer, survey.participants);
    surveyCurrentAnswer >= survey.participants;
    if (surveyCurrentAnswer >= survey.participants) {
      return res
        .status(404)
        .send({ message: "Survey recieved enough response" });
    }
    let results = survey.result.filter(
      (item) => item.user.toString() == req.user._id.toString()
    );
    if (results.length > 0) {
      return res
        .status(404)
        .send({ message: "You have already requested this survey" });
    }
    const newSurveyResult = {
      user: req.user._id,
      surveyStatus: AppConstant.SURVEY_RESULT_STATUS.ACCEPT,
      timeStart: Date.now(),
    };
    survey.result.unshift(newSurveyResult);

    await setTimeout(async () => {
      let sur = await Survey.findOne({
        _id: req.params.id,
        "result.user": req.user._id,
      });
      let results = sur.result.filter(
        (item) => item.surveyStatus === AppConstant.SURVEY_RESULT_STATUS.ACCEPT
      );
      if (results.length > 0) {
        const surveys = await Survey.findOneAndUpdate(
          {
            _id: req.params.id,
            "result.user": req.user._id,
          },
          {
            $set: {
              "result.$.surveyStatus": AppConstant.SURVEY_RESULT_STATUS.ABANDON,
            },
          }
        );
        await surveys.save();
      }
    }, 7200000);
    await survey.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};
//user survey response
//survey responsoe
exports.surveyResponse = async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      {
        _id: req.params.id,
        "result._id": req.params.result,
      },
      {
        $set: {
          "result.$.code": req.body.code,
          "result.$.surveyStatus": AppConstant.SURVEY_RESULT_STATUS.SUBMIT,
          "result.$.resultStatus": AppConstant.SURVEY_ANSWER_STATUS.PENDING,
        },
      }
    );
    let surveys = await Survey.findOne({ _id: req.params.id });
    let surveyComplted = await surveys.result.filter(
      (item) => item.surveyStatus === AppConstant.SURVEY_RESULT_STATUS.SUBMIT
    );
    if (surveyComplted.length >= surveys.participants) {
      surveys.status = AppConstant.SURVEY_STATUS.COMPLETED;
      await surveys.save();
    }
    await survey.save();
    res.send(survey);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
//suser survey return
exports.surveyReturn = async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      {
        _id: req.params.id,
        "result.user": req.user._id,
      },
      {
        $set: {
          "result.$.surveyStatus": AppConstant.SURVEY_RESULT_STATUS.RETURN,
        },
      }
    );
    await survey.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};
//survey abond
exports.surveyAbandon = async (req, res) => {
  try {
    const surveys = await Survey.findOneAndUpdate(
      {
        _id: req.params.id,
        "result.user": req.user._id,
      },
      {
        $set: {
          "result.$.surveyStatus": AppConstant.SURVEY_RESULT_STATUS.ABANDON,
        },
      }
    );
    await surveys.save();
    res.send(surveys);
  } catch (error) {
    res.status(500).send(error);
  }
};
//suser survey return
exports.forcefulExit = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    survey.status = AppConstant.SURVEY_STATUS.COMPLETED;
    await survey.save();
    res.send(survey);
  } catch (error) {
    res.status(500).send(error);
  }
};

//// survey list users

exports.suveyListEndUser = async (req, res) => {
  try {
    const surveys = await Survey.find({
      status: AppConstant.SURVEY_STATUS.APPROVE,
    }).sort({ createdAt: -1 });
    res.send({ surveys });
  } catch (error) {
    res.status(500).send(error);
  }
};
//survey approve all

exports.surveyApproveAll = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      user: req.user._id,
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
