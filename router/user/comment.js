const comment_router = require("express").Router();
const auth_middleware = require("../..//middleware/authMiddleware");

const {
  comment_create,
  comment_by_id,
  comment_edit,
  comment_list_filtered_by_article,
  comment_like,
  comment_unlike,
  comment_violate,
  comment_delete,
  comment_list_filted_by_user,
} = require("../../controller/user/commentController");

const { comment_middlware } = require("../../middleware/formMiddleware");
// @private
comment_router.post(
  "/article/:id/comment",
  auth_middleware,
  comment_middlware,
  comment_create
);
comment_router.put("/comment/:id", auth_middleware, comment_edit);
comment_router.post("/comment/:id/like", auth_middleware, comment_like);
comment_router.post("/comment/:id/unlike", auth_middleware, comment_unlike);
comment_router.post("/comment/violation/:id", auth_middleware, comment_violate);
comment_router.post("/comment/block/:id", auth_middleware, comment_delete);
//@public
comment_router.get("/articles/:id/comments", comment_list_filtered_by_article);
comment_router.get("/comments/:id", comment_by_id);
comment_router.get(
  "/commentsbyuser",
  auth_middleware,
  comment_list_filted_by_user
);

module.exports = comment_router;
