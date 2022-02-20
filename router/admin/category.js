const admin_category = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  category_create,
  category_list,
  category_edit,
  category_add_channel,
  category_remove_channel,
  category_block,
  category_unblock,
} = require("../../controller/admin/categoryManagement");

/********* Category  managment *******/
admin_category.post(
  "/admin/category_create",
  admin_middleware,
  category_create
);
admin_category.get("/admin/categorylist", admin_middleware, category_list);
admin_category.post(
  "/admin/category_edit/:id",
  admin_middleware,
  category_edit
);
admin_category.post(
  "/admin/category_add_channel/:id/:cid",
  admin_middleware,
  category_add_channel
);
admin_category.post(
  "/admin/category_remove_channel/:id/:cid",
  admin_middleware,
  category_remove_channel
);
admin_category.post(
  "/admin/category_block/:id",
  admin_middleware,
  category_block
);
admin_category.post(
  "/admin/category_unblock/:id",
  admin_middleware,
  category_unblock
);
module.exports = admin_category;
