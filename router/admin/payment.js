const admin_payment = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  payment_add,
  payment_list,
  payment_remove,
} = require("../../controller/admin/paymentManagement");

/********* User managment *******/
// payment
admin_payment.post("/admin/addpayment/:id", admin_middleware, payment_add);
admin_payment.post(
  "/admin/removepayment/:id",
  admin_middleware,
  payment_remove
);
admin_payment.get("/admin/paymentlist/:id", admin_middleware, payment_list);

module.exports = admin_payment;
