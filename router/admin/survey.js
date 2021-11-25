const admin_survey = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  survey_list,
  survey_approve,
  survey_reject,
  survey_approve_all_pending,
  survey_forced_exit,
} = require("../../controller/admin/suveyManagement");

/********* User managment *******/
admin_survey.get("/adminsurveylist", admin_middleware, survey_list);
admin_survey.post("/adminsurveyapprove/:id", admin_middleware, survey_approve);
admin_survey.post("/adminsurveyreject/:id", admin_middleware, survey_reject);
admin_survey.post(
  "/adminsurveyapproveall",
  admin_middleware,
  survey_approve_all_pending
);
admin_survey.post(
  "/surveyadminforcedexit/:id",
  admin_middleware,
  survey_forced_exit
);

module.exports = admin_survey;
