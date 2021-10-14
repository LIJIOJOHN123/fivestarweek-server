const guestRouter = require("express").Router();
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 100 requests per windowMs
});

const {
  registartion,
  login,
  googleLogin,
  facebookLogin,
  forgotPassword,
  resetPassword,
} = require("../controller/userController");
const { createAdmin } = require("../controller/adminController");
const { runValidation } = require("../middleware/validatorerror");
const {
  registerMiddlware,
  loginMiddlware,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../middleware/formMiddleware");
/********* users *******/
guestRouter.post(
  "/register",
  limiter,
  registerMiddlware,
  runValidation,
  registartion
);
guestRouter.post("/login", limiter, loginMiddlware, runValidation, login);
/********* admin *******/
guestRouter.post("/admin", createAdmin);
guestRouter.post("/google_login", googleLogin);
guestRouter.post("/facebook_login", facebookLogin);
guestRouter.put(
  "/forgot_password",
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);
guestRouter.put(
  "/reset_password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);

module.exports = guestRouter;
