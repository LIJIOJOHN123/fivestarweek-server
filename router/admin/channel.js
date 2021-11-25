const admin_channel = require("express").Router();
const admin_middleware = require("../../middleware/adminMiddleware");
const {
  channel_list,
  channel_block,
  channel_unblock,
  channel_search,
  channel_add_verification,
  channel_remove_vefication,
  channel_add_additional_info,
} = require("../../controller/admin/channelManagement");

/********* Channel managment *******/
admin_channel.get("/admin/channels", admin_middleware, channel_list);
admin_channel.post("/admin/blockchannel/:id", admin_middleware, channel_block);
admin_channel.post(
  "/admin/unblockchannel/:id",
  admin_middleware,
  channel_unblock
);
admin_channel.post(
  "/admin/addchanneldetails/:id",
  admin_middleware,
  channel_add_additional_info
);

admin_channel.post(
  "/admin/channel/verification/:id",
  admin_middleware,
  channel_add_verification
);
admin_channel.post(
  "/admin/channel/removeverification/:id",
  admin_middleware,
  channel_remove_vefication
);
admin_channel.get("/admin/channelsearch", admin_middleware, channel_search);

module.exports = admin_channel;
