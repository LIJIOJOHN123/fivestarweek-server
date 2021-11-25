const admin_common = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const admin_middleware = require("../../middleware/adminMiddleware");

const {
  add_country_list,
  add_language,
  add_language_list,
  department_managment_add,
  task_managment_add,
  team_managment_add,
} = require("../../controller/admin/commonManagement");

/********* Category managment *******/

admin_common.post("/admin/addlanguage", department_middleware, add_language);

admin_common.post("/counry", add_country_list);
admin_common.post("/language", add_language_list);
admin_common.post("/team/admin", admin_middleware, team_managment_add);
admin_common.post(
  "/department/admin",
  admin_middleware,
  department_managment_add
);
admin_common.post("/task/admin", admin_middleware, task_managment_add);

//admin

module.exports = admin_common;
