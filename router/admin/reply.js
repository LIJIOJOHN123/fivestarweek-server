const admin_reply = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  reply_list,
  reply_block,
  reply_unblock,
  reply_violation_list,
  reply_search,
} = require("../../controller/admin/replyManagement");

/********* User managment *******/
admin_reply.get("/admin/replylist", department_middleware, reply_list);
admin_reply.post("/admin/blockreply/:id", department_middleware, reply_block);
admin_reply.post(
  "/admin/unblockreply/:id",
  department_middleware,
  reply_unblock
);
admin_reply.get(
  "/admin/replyviolationlist",
  department_middleware,
  reply_violation_list
);
admin_reply.get("/admin/replysearch", department_middleware, reply_search);

module.exports = admin_reply;
