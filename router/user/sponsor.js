const sponsor_router = require("express").Router();
const {
  sponsor_article_create,
  sponsor_channel_create,
  sponsor_filtered_by_created_user,
  sponsor_channel_by_id,
  sponsor_article_by_id,
  sponsor_article_delete,
  sponsor_channel_delete,
  sponsor_article_users,
  sponsor_channel_users,
} = require("../../controller/user/sponsorController");
const auth_middleware = require("../../middleware/authMiddleware");
const mix_middleware = require("../../middleware/mixMiddleware");

//sponsor
sponsor_router.get(
  "/sponsoruserlist",
  auth_middleware,
  sponsor_filtered_by_created_user
);
sponsor_router.post("/articlesponsor", auth_middleware, sponsor_article_create);
sponsor_router.post("/channelsponsor", auth_middleware, sponsor_channel_create);
sponsor_router.get(
  "/sponsorechannelbyid/:id",
  auth_middleware,
  sponsor_channel_by_id
);
sponsor_router.get("/articlesponsorelist", sponsor_article_users);
sponsor_router.get("/channelsponosrelist", sponsor_channel_users);

sponsor_router.post(
  "/articlesponosordelete/:id",
  auth_middleware,
  sponsor_article_delete
);
sponsor_router.post(
  "/channelsponsordelete/:id",
  auth_middleware,
  sponsor_channel_delete
);
sponsor_router.get(
  "/sponsorearticlebyid/:id",
  auth_middleware,
  sponsor_article_by_id
);
module.exports = sponsor_router;
