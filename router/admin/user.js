const admin_user = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  user_list,
  user_block,
  user_unblock,
  user_search,
  user_info_add,
} = require("../../controller/admin/userManagement");

/********* User managment *******/
admin_user.post("/admin/blockuser/:id", admin_middleware, user_block);
admin_user.post("/admin/unblockuser/:id", admin_middleware, user_unblock);
admin_user.get("/admin/users", admin_middleware, user_list);
admin_user.get("/admin/usersearch", admin_middleware, user_search);
admin_user.post("/admin/userinfoadd/:id", admin_middleware, user_info_add);

module.exports = admin_user;
