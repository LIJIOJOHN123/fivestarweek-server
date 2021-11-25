const admin_comment = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  comment_list,
  comment_block,
  comment_unblock,
  comment_violation_list,
  comment_search,
} = require("../../controller/admin/commentManagement");

/********* User managment *******/
admin_comment.post("/admin/blockcomment/:id", admin_middleware, comment_block);
admin_comment.post(
  "/admin/unblockcomment/:id",
  admin_middleware,
  comment_unblock
);
admin_comment.get("/admin/commentlist", admin_middleware, comment_list);
admin_comment.get("/admin/violationcomments", comment_violation_list);
admin_comment.get("/admin/commentsearch", admin_middleware, comment_search);

module.exports = admin_comment;
