const channel_router = require("express").Router();

const {
  //channel owners
  channel_create,
  channel_list_by_created_user,
  channel_edit,
  channel_add_image,
  channel_delete,

  //channel_auth users

  channel_follow,
  channel_unfollow,
  channel_filter_followed_by_user,
  channel_filter_unfollowed_by_user,
  channel_view_auth,
  channel_visit_auth,
  channel_list_suggestion_auth_user_by_qualification,

  //public
  channel_by_id,
  channel_name_exists_check,
  channel_view_public,
  channel_visit_public,
  channel_list_public,
} = require("../../controller/user/channelController");

const { channel_middleware } = require("../../middleware/formMiddleware");
const auth_middleware = require("../../middleware/authMiddleware");

const multer = require("multer");
var multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const uuid = require("uuid").v4;
const S3 = new aws.S3();
aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SCECRET_KEY,
  region: process.env.AWS_REGION,
});
//upload image
var upload = multer({
  storage: multerS3({
    size: 3000,
    s3: S3,
    bucket: "testing91081/channel",
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

/******************************** Private  ******************************/
/*** Channel owners  *********/

channel_router.post(
  "/channel",
  auth_middleware,
  channel_middleware,
  channel_create
);
channel_router.get("/channel", auth_middleware, channel_list_by_created_user);
channel_router.patch("/channel/:id", auth_middleware, channel_edit);
channel_router.put("/channel/:id", auth_middleware, channel_delete);
channel_router.post(
  "/channel/upload/:id",
  auth_middleware,
  upload.single("avatar"),
  channel_add_image
);

/*** Channel auth users  *********/

channel_router.post("/channel/:id/follow", auth_middleware, channel_follow);
channel_router.post("/channel/:id/unfollow", auth_middleware, channel_unfollow);

channel_router.get(
  "/nonchannel/followed",
  auth_middleware,
  channel_filter_followed_by_user
);
channel_router.get(
  "/nonchannel/unfollowed",
  auth_middleware,
  channel_filter_unfollowed_by_user
);

channel_router.post("/channel/:id/view", auth_middleware, channel_view_auth);
channel_router.post("/channel/:id/visit", auth_middleware, channel_visit_auth);
channel_router.get(
  "/channel/suggested",
  auth_middleware,
  channel_list_suggestion_auth_user_by_qualification
);

/******************************** public  ******************************/

channel_router.get("/channels", channel_list_public);
channel_router.get("/channels/:id", channel_by_id);
channel_router.post("/channel/channelname", channel_name_exists_check);
channel_router.post("/channel/ipvisitor/:id", channel_visit_public);
channel_router.post("/channel/ipview/:id", channel_view_public);

module.exports = channel_router;
