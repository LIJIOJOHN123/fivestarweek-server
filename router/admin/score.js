const admin_score = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  score_list,
  score_add,
  score_remove,
} = require("../../controller/admin/scoreManagement");

/********* User managment *******/

admin_score.post("/admin/scoreadd/:id", admin_middleware, score_add);
admin_score.post("/admin/scoreremove/:id", admin_middleware, score_remove);
admin_score.get("/adminscorelist/:id", admin_middleware, score_list);

module.exports = admin_score;
