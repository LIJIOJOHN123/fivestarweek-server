const admin_team = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");

const {
  team_member,
  team_member_remove,
  team_members_list,
  team_members_list_by_department,
  team_members_list_by_teamLeader,
  team_members_list_by_manager,
  team_remove_task,
  team_add_task,
  team_member_by_user,
} = require("../../controller/admin/teamManagement");

//task

admin_team.post("/team_member", admin_middleware, team_member);
admin_team.post("/team/block/:id", admin_middleware, team_member_remove);
admin_team.post("/team/add/:id/tid", admin_middleware, team_add_task);
admin_team.post("/task/remove/:id/tid", admin_middleware, team_remove_task);

admin_team.get("/team/list", admin_middleware, team_members_list);
admin_team.get(
  "/team/department/list",
  admin_middleware,
  team_members_list_by_department
);
admin_team.get(
  "/team/tealeader/list",
  admin_middleware,
  team_members_list_by_teamLeader
);
admin_team.get(
  "/team/manager/list",
  admin_middleware,
  team_members_list_by_manager
);
admin_team.get("/team/team_by_user", admin_middleware, team_member_by_user);
module.exports = admin_team;
