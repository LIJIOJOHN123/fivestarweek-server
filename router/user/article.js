const article_router = require("express").Router();
const { article_middleware } = require("../../middleware/formMiddleware");
const auth_middleware = require("../../middleware/authMiddleware");

const {
  article_create,
  article_like,
  article_unlike,
  article_by_id,
  article_list_by_channel_crated_user,
  article_list_by_channel_followers,
  article_violation,
  article_delete,
  article_view_auth,
  aritcle_view_public,
  article_visit_auth,
  article_visit_public,
  article_statitcs,
} = require("../../controller/user/articleController");

/******************************** Article ******************************/

//@private
article_router.post(
  "/channel/:id/article",
  auth_middleware,
  article_middleware,
  article_create
);
article_router.get(
  "/channel/:id/article",
  auth_middleware,
  article_list_by_channel_crated_user
);
article_router.post("/article/:id/like", auth_middleware, article_like);
article_router.post("/article/:id/unlike", auth_middleware, article_unlike);
article_router.get(
  "/ariclechannel/followers",
  auth_middleware,
  article_list_by_channel_followers
);

article_router.post(
  "/article/violation/:id",
  auth_middleware,
  article_violation
);
article_router.post("/article/:id/view", auth_middleware, article_view_auth);
article_router.post("/article/ipview/:id", aritcle_view_public);
article_router.post("/article/:id/visit", auth_middleware, article_visit_auth);
article_router.post("/article/ipvisitor/:id", article_visit_public);
article_router.post("/articles/delete/:id", auth_middleware, article_delete);

//@public

article_router.get("/articles/:id", article_by_id);
article_router.get("/articlestatics/:id", article_statitcs);

module.exports = article_router;
