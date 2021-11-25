const admin_article = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  article_list,
  article_block,
  article_unblock,
  article_violation_list,
  article_search,
} = require("../../controller/admin/articleManagement");

/********* User managment *******/
admin_article.get("/admin/articles", department_middleware, article_list);
admin_article.post(
  "/admin/blockarticle/:id",
  department_middleware,
  article_block
);
admin_article.post(
  "/admin/unblockarticle/:id",
  department_middleware,
  article_unblock
);
admin_article.get(
  "/admin/articlesearch",
  department_middleware,
  article_search
);

admin_article.get("/admin/violationarticle", article_violation_list);

module.exports = admin_article;
