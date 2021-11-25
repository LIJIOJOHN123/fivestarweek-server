const admin_comment = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  comment_list,
  comment_block,
  comment_unblock,
  comment_violation_list,
  comment_search,
} = require("../../controller/admin/commentManagement");

/********* User managment *******/
admin_comment.post(
  "/admin/blockcomment/:id",
  department_middleware,
  comment_block
);
admin_comment.post(
  "/admin/unblockcomment/:id",
  department_middleware,
  comment_unblock
);
admin_comment.get("/admin/commentlist", department_middleware, comment_list);
admin_comment.get("/admin/violationcomments", comment_violation_list);
admin_comment.get(
  "/admin/commentsearch",
  department_middleware,
  comment_search
);

module.exports = admin_comment;
