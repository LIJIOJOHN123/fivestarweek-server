const admin_payment = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
const {
  payment_add,
  payment_list,
  payment_remove,
} = require("../../controller/admin/paymentManagement");

/********* User managment *******/
// payment
admin_payment.post("/admin/addpayment/:id", department_middleware, payment_add);
admin_payment.post(
  "/admin/removepayment/:id",
  department_middleware,
  payment_remove
);
admin_payment.get(
  "/admin/paymentlist/:id",
  department_middleware,
  payment_list
);

module.exports = admin_payment;
