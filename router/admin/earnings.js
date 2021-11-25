const admin_earnings = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  earnings_list,
  earnings_add,
  earnings_remove,
  earnings_withdraw_list,
  earnings_withdraw_approval,
} = require("../../controller/admin/earningsManagement");

/********* User managment *******/
//earnings
admin_earnings.post(
  "/admin/addearning/:id",
  department_middleware,
  earnings_add
);
admin_earnings.post(
  "/admin/removeearning/:id",
  department_middleware,
  earnings_remove
);
admin_earnings.get(
  "/admin/withdrawallist",
  department_middleware,
  earnings_withdraw_list
);
admin_earnings.post(
  "/admin/approvewithdrawal/:id",
  department_middleware,
  earnings_withdraw_approval
);
admin_earnings.get(
  "/admin/earninglist/:id",
  department_middleware,
  earnings_list
);

module.exports = admin_earnings;
