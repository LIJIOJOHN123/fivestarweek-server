const admin_channel = require("express").Router();
const department_middleware = require("../../middleware/departmentMiddleware");
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
admin_channel.get("/admin/channels", department_middleware, channel_list);
admin_channel.post(
  "/admin/blockchannel/:id",
  department_middleware,
  channel_block
);
admin_channel.post(
  "/admin/unblockchannel/:id",
  department_middleware,
  channel_unblock
);
admin_channel.post(
  "/admin/addchanneldetails/:id",
  department_middleware,
  channel_add_additional_info
);

admin_channel.post(
  "/admin/channel/verification/:id",
  department_middleware,
  channel_add_verification
);
admin_channel.post(
  "/admin/channel/removeverification/:id",
  department_middleware,
  channel_remove_vefication
);
admin_channel.get(
  "/admin/channelsearch",
  department_middleware,
  channel_search
);

module.exports = admin_channel;
