const mongoose = require("mongoose");
const AppConstant = require("../config/appConstants");
const Schema = mongoose.Schema;

const surveySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    ageFrom: {
      type: Number,
    },
    ageTo: {
      type: Number,
    },
    surveyLink: {
      type: String,
    },
    participants: {
      type: Number,
    },
    perSurveyPrice: {
      type: Number,
    },
    total: {
      type: Number,
    },
    fee: {
      type: Number,
    },
    instruction: {
      type: String,
    },
    grandTotal: {
      type: Number,
    },

    result: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        code: {
          type: String,
        },
        timeStart: {
          type: Number,
        },
        surveyStatus: {
          type: Number,
          enum: [
            AppConstant.SURVEY_RESULT_STATUS.ACCEPT,
            AppConstant.SURVEY_RESULT_STATUS.SKIP,
            AppConstant.SURVEY_RESULT_STATUS.SUBMIT,
            AppConstant.SURVEY_RESULT_STATUS.RETURN,
            AppConstant.SURVEY_RESULT_STATUS.ABANDON,
          ],
        },
        resultStatus: {
          type: Number,
          enum: [
            AppConstant.SURVEY_ANSWER_STATUS.PENDING,
            AppConstant.SURVEY_ANSWER_STATUS.APPROVE,
            AppConstant.SURVEY_ANSWER_STATUS.REJECT,
          ],
        },
      },
    ],
    status: {
      type: Number,
      default: AppConstant.SURVEY_STATUS.PENDING,
      enum: [
        AppConstant.SURVEY_STATUS.PENDING,
        AppConstant.SURVEY_STATUS.APPROVE,
        AppConstant.SURVEY_STATUS.REJECT,
        AppConstant.SURVEY_STATUS.COMPLETED,
        AppConstant.SURVEY_STATUS.BLOCK,
      ],
    },
    gender: {
      type: String,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
  },

  { timestamps: true }
);
const Survey = mongoose.model("Survey", surveySchema);

module.exports = Survey;
