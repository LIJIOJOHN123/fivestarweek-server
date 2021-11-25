const admin_task = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");

const {
  task_create,
  task_block,
  task_unblock,
  task_edit,
  task_lists_all,
  task_list,
} = require("../../controller/admin/taskManagement");

//task

admin_task.post("/task", department_middleware, task_create);
admin_task.post("/task/block/:id", department_middleware, task_block);
admin_task.post("/task/unblock/:id", department_middleware, task_unblock);
admin_task.post("/task/edit/:id", department_middleware, task_edit);
admin_task.get("/task/list", department_middleware, task_lists_all);
admin_task.get("/task/lists", department_middleware, task_list);
module.exports = admin_task;
