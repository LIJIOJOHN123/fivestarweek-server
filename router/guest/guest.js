const guest_router = require("express").Router();
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 100 requests per windowMs
});

const {
  user_registartion,
  user_login,
  user_google_login,
  user_facebook_login,
  user_forgot_password,
  user_reset_password,
  master_admin_create,
  user_mobile_login,
} = require("../../controller/guest/guestUserController");
const { run_validation } = require("../../middleware/validatorerror");
const {
  register_middleware,
  login_middlware,
  forgot_password_validator,
  reset_password_validator,
} = require("../../middleware/formMiddleware");
/********* users *******/

guest_router.post(
  "/login",
  limiter,
  login_middlware,
  run_validation,
  user_login
);
guest_router.post("/register", register_middleware, user_registartion);
guest_router.post("/mobile_login", user_mobile_login);
/********* admin *******/
guest_router.post("/admin", master_admin_create);
guest_router.post("/google_login", user_google_login);
guest_router.post("/facebook_login", user_facebook_login);
guest_router.put(
  "/forgot_password",
  forgot_password_validator,
  run_validation,
  user_forgot_password
);
guest_router.put(
  "/reset_password",
  reset_password_validator,
  run_validation,
  user_reset_password
);

module.exports = guest_router;
