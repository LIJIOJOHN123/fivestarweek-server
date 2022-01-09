const user_router = require("express").Router();
const auth_middleware = require("../../middleware/authMiddleware");

const {
  user_update,
  user_info_auth,
  user_logout,
  user_logout_all,
  user_username_exist_check,
  user_change_email,
  user_change_password,
  user_get_intro_profile,
  user_add_avatar,
  user_become_premium_user,
  user_email_verification_request,
  user_email_verify,
  user_premium_callback_api,
  user_become_premium_user_paytm,
} = require("../../controller/user/userController");
const { run_validation } = require("../../middleware/validatorerror");

const multer = require("multer");
var multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const uuid = require("uuid").v4;
aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SCECRET_KEY,
  region: process.env.AWS_REGION,
});
const S3 = new aws.S3();

//upload image
var upload = multer({
  storage: multerS3({
    size: 3000,
    s3: S3,
    bucket: "fivestarweek/profile",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const extendname = file.originalname.split(".");
      const fileName = extendname[extendname.length - 1];
      if (fileName === "jpeg" || fileName === "jpg" || fileName === "png") {
        cb(null, uuid() + "." + fileName);
      }
    },
  }),
});
// @private
user_router.put("/user", auth_middleware, run_validation, user_update);
user_router.patch("/user/userName", auth_middleware, user_username_exist_check);
user_router.get("/user", auth_middleware, user_info_auth);
user_router.post("/logout", auth_middleware, user_logout);
user_router.post("/logoutall", auth_middleware, user_logout_all);
user_router.post("/changeemail", auth_middleware, user_change_email);
user_router.post("/changepassword", auth_middleware, user_change_password);
user_router.post("/userpremium", auth_middleware, user_become_premium_user);
user_router.post(
  "/userpremiumpaytm",
  auth_middleware,
  user_become_premium_user_paytm
);

user_router.post(
  "/emailverification",
  auth_middleware,
  user_email_verification_request
);
user_router.post("/emailverifyonline", auth_middleware, user_email_verify);
user_router.get("/callback/premium/:id/:amount", user_premium_callback_api);

user_router.post(
  "/profile/uploadone",
  auth_middleware,
  upload.single("avatar"),
  user_add_avatar
);

user_router.get(
  "/getpublicprofile/:id",
  auth_middleware,
  user_get_intro_profile
);

module.exports = user_router;
