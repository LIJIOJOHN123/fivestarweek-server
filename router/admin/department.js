const admin_department = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");

const {
  department_create,
  department_unblock,
  department_block,
  department_by_id,
  department_lists,
  department_task_add,
  department_task_remove,
} = require("../../controller/admin/deparmentManagement");

//task

admin_department.post("/department", department_middleware, department_create);
admin_department.post(
  "/department/block/:id",
  department_middleware,
  department_block
);
admin_department.post(
  "/department/unblock/:id",
  department_middleware,
  department_unblock
);
admin_department.get(
  "/department/list_by_id",
  department_middleware,
  department_by_id
);
admin_department.get(
  "/department/list_by_id",
  department_middleware,
  department_lists
);
admin_department.post(
  "/department/add/:id/:tid",
  department_middleware,
  department_task_add
);
admin_department.post(
  "/department/remove/:id/:tid",
  department_middleware,
  department_task_remove
);
module.exports = admin_department;
