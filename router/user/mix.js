const mix_router = require("express").Router();
const {
  country_list,
  state_list,
  lanagauge_list,
  earnings_add_bank_account,
  earnings_list,
  earning_withdraw,
  notification_list,
  notification_read,
  notification_read_all,
  score_list_user,
  payment_list,
  payment_add,
  payment_add_callback_api,
  search,
  presearch,
  refer_link,
  refer_user_details,
  send_marketing_emails,
  user_qualification_filter_details,
  user_qaulfication_by_id,
  premium_initilization,
  premium_callback_api,
  searchMobile,
  presearchMobile,
} = require("../../controller/user/mixController");
const mix_middleware = require("../../middleware/mixMiddleware");
const {
  category_list,
  category_by_id,
  category_subscribe,
  category_unsubscribe,
  category_by_id_website,
} = require("../../controller/user/categoryContoller");
const auth_middleware = require("../../middleware/authMiddleware");

mix_router.get("/country", country_list);
mix_router.get("/country/:id", state_list);
mix_router.get("/languages", lanagauge_list);

//earnings
mix_router.post("/bankaccount", auth_middleware, earnings_add_bank_account);
mix_router.get("/earnings", auth_middleware, earnings_list);
mix_router.post("/withdraw", auth_middleware, earning_withdraw);

// Notification
mix_router.get("/user/notification", auth_middleware, notification_list);
mix_router.post("/notification/read/:id", auth_middleware, notification_read);
mix_router.post(
  "/notification/allread",
  auth_middleware,
  notification_read_all
);

//score
mix_router.get("/scorelist", auth_middleware, score_list_user);

//payment

mix_router.post("/addpayment", auth_middleware, payment_add);
mix_router.get("/callback/payment/:id/:amount", payment_add_callback_api);
mix_router.get("/user/transactions", auth_middleware, payment_list);

//Referal
mix_router.get("/referonline", auth_middleware, refer_link);
mix_router.get("/referbyuser", refer_user_details);
mix_router.post("/sendemailinviation", auth_middleware, send_marketing_emails);

//search
mix_router.get("/searching", mix_middleware, search);
mix_router.get("/presearchresult", presearch);
mix_router.get("/searching_mobile", mix_middleware, searchMobile);
mix_router.get("/presearchresult_mobile", presearchMobile);

mix_router.post(
  "/userpreference/:id",
  auth_middleware,
  user_qualification_filter_details
);
mix_router.get(
  "/user/userpreference",
  auth_middleware,
  user_qaulfication_by_id
);

//seller
mix_router.post("/createpremiumrequest", mix_middleware, premium_initilization);

mix_router.get("/callback/premiumsale/:id/:amount", premium_callback_api);

//category
mix_router.get("/categorylist/:id", category_list);
mix_router.get("/category_by_id/:id", category_by_id);
mix_router.get("/category_by_id_website/:id", category_by_id_website);

mix_router.post("/category_subscribe/:id", auth_middleware, category_subscribe);
mix_router.post(
  "/category_unsubscribe/:id",
  auth_middleware,
  category_unsubscribe
);

module.exports = mix_router;
