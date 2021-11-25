const admin_publisher = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  publisher_block,
  publisher_unblock,
  publisher_list,
} = require("../../controller/admin/publisherManagement");

/********* User managment *******/

admin_publisher.get("/admin/publishers", admin_middleware, publisher_list);
admin_publisher.post(
  "/admin/publsher/block:id",
  admin_middleware,
  publisher_block
);
admin_publisher.post(
  "/admin/publsher/unblock:id",
  admin_middleware,
  publisher_unblock
);

module.exports = admin_publisher;
