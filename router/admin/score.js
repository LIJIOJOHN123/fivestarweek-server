const admin_score = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  score_list,
  score_add,
  score_remove,
} = require("../../controller/admin/scoreManagement");

/********* User managment *******/

admin_score.post("/admin/scoreadd/:id", department_middleware, score_add);
admin_score.post("/admin/scoreremove/:id", department_middleware, score_remove);
admin_score.get("/adminscorelist/:id", department_middleware, score_list);

module.exports = admin_score;
