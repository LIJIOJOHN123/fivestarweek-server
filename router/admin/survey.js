const admin_survey = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  survey_list,
  survey_approve,
  survey_reject,
  survey_approve_all_pending,
  survey_forced_exit,
} = require("../../controller/admin/suveyManagement");

/********* User managment *******/
admin_survey.get("/adminsurveylist", department_middleware, survey_list);
admin_survey.post(
  "/adminsurveyapprove/:id",
  department_middleware,
  survey_approve
);
admin_survey.post(
  "/adminsurveyreject/:id",
  department_middleware,
  survey_reject
);
admin_survey.post(
  "/adminsurveyapproveall",
  department_middleware,
  survey_approve_all_pending
);
admin_survey.post(
  "/surveyadminforcedexit/:id",
  department_middleware,
  survey_forced_exit
);

module.exports = admin_survey;
