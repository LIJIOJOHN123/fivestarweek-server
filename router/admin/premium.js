const admin_premium_user = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  premium_user_list,
  premium_user_approve,
  premium_user_list_salesteam,
} = require("../../controller/admin/premiumManagement");

admin_premium_user.get(
  "/premieruserlist",
  department_middleware,
  premium_user_list
);
admin_premium_user.post(
  "/premieruserlistapprove/:id",
  department_middleware,
  premium_user_approve
);
admin_premium_user.get(
  "/premieruserlist",
  department_middleware,
  premium_user_list_salesteam
);

module.exports = admin_premium_user;
