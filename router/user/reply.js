const reply_router = require("express").Router();

const { reply_middleware } = require("../../middleware/formMiddleware");
const auth_middleware = require("../../middleware/authMiddleware");

const {
  reply_create,
  reply_list_filtered_by_comment,
  reply_edit,
  reply_delete,
  reply_violation,
  reply_like,
  reply_unlike,
} = require("../../controller/user/replyController");
/******************************** Reply ******************************/
//@private
reply_router.post(
  "/comment/:id/reply",
  reply_middleware,
  auth_middleware,
  reply_create
);
reply_router.put("/reply/:id", auth_middleware, reply_edit);
reply_router.post("/reply/:id", auth_middleware, reply_delete);
reply_router.post("/reply/violation/:id", auth_middleware, reply_violation);
reply_router.post("/reply/:id/like", auth_middleware, reply_like);
reply_router.post("/reply/:id/unlike", auth_middleware, reply_unlike);
//@public
reply_router.get("/comment/:id/reply", reply_list_filtered_by_comment);

module.exports = reply_router;
