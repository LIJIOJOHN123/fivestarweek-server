const admin_publisher = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  publisher_block,
  publisher_unblock,
  publisher_list,
} = require("../../controller/admin/publisherManagement");

/********* User managment *******/

admin_publisher.get("/admin/publishers", department_middleware, publisher_list);
admin_publisher.post(
  "/admin/publsher/block:id",
  department_middleware,
  publisher_block
);
admin_publisher.post(
  "/admin/publsher/unblock:id",
  department_middleware,
  publisher_unblock
);

module.exports = admin_publisher;
