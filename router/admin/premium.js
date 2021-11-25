const admin_premium_user = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  premium_user_list,
  premium_user_approve,
  premium_user_list_salesteam,
} = require("../../controller/admin/premiumManagement");

admin_premium_user.get("/premieruserlist", admin_middleware, premium_user_list);
admin_premium_user.post(
  "/premieruserlistapprove/:id",
  admin_middleware,
  premium_user_approve
);
admin_premium_user.get(
  "/premieruserlist",
  admin_middleware,
  premium_user_list_salesteam
);

module.exports = admin_premium_user;
