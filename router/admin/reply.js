const admin_reply = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  reply_list,
  reply_block,
  reply_unblock,
  reply_violation_list,
  reply_search,
} = require("../../controller/admin/replyManagement");

/********* User managment *******/
admin_reply.get("/admin/replylist", admin_middleware, reply_list);
admin_reply.post("/admin/blockreply/:id", admin_middleware, reply_block);
admin_reply.post("/admin/unblockreply/:id", admin_middleware, reply_unblock);
admin_reply.get(
  "/admin/replyviolationlist",
  admin_middleware,
  reply_violation_list
);
admin_reply.get("/admin/replysearch", admin_middleware, reply_search);

module.exports = admin_reply;
