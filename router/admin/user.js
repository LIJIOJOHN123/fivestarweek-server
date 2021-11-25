const admin_user = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  user_list,
  user_block,
  user_unblock,
  user_search,
  user_info_add,
} = require("../../controller/admin/userManagement");

/********* User managment *******/
admin_user.post("/admin/blockuser/:id", department_middleware, user_block);
admin_user.post("/admin/unblockuser/:id", department_middleware, user_unblock);
admin_user.get("/admin/users", department_middleware, user_list);
admin_user.get("/admin/usersearch", department_middleware, user_search);
admin_user.post("/admin/userinfoadd/:id", department_middleware, user_info_add);

module.exports = admin_user;
