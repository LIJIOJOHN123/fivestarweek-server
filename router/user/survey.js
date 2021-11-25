const survey_router = require("express").Router();

const {
  survey_create,
  survey_delete,
  survey_filtered_by_created_user,
  survey_by_id_created_user,
  survey_creator_approve,
  survey_creator_reject,
  survey_by_id_user,
  survey_response_submit_user,
  survey_accept_user,
  survey_return_user,
  survey_abandon_user,
  survey_exit_by_force_created_user,
  survey_list_user,
  survey_approve_all,
} = require("../../controller/user/surveyController");
const auth_middleware = require("../../middleware/authMiddleware");

//suvey
survey_router.post("/surveycreate", auth_middleware, survey_create);
survey_router.post("/surveydelete/:id", auth_middleware, survey_delete);
survey_router.get(
  "/surveylist",
  auth_middleware,
  survey_filtered_by_created_user
);
survey_router.post(
  "/surveyapprove/:id/:result",
  auth_middleware,
  survey_creator_approve
);
survey_router.post(
  "/surveyreject/:id/:result",
  auth_middleware,
  survey_creator_reject
);
survey_router.get(
  "/surveybyid/:id",
  auth_middleware,
  survey_by_id_created_user
);
survey_router.get("/surveybyidenduser/:id", auth_middleware, survey_by_id_user);
survey_router.post(
  "/surveyaccepteligibility/:id",
  auth_middleware,
  survey_accept_user
);
survey_router.post(
  "/surveyresponsoe/:id/:result",
  auth_middleware,
  survey_response_submit_user
);
survey_router.post(
  "/surveyreturn/:id/:result",
  auth_middleware,
  survey_return_user
);
survey_router.post(
  "/surveyabandon/:id/:result",
  auth_middleware,
  survey_abandon_user
);
survey_router.post(
  "/surveyapproveall/:id",
  auth_middleware,
  survey_approve_all
);
survey_router.post(
  "/surveyexit/:id",
  auth_middleware,
  survey_exit_by_force_created_user
);
survey_router.get("/surveylistenduser", auth_middleware, survey_list_user);
module.exports = survey_router;
