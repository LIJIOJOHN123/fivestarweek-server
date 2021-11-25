const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const helmet = require("helmet");
var compression = require("compression");

require("dotenv").config({ path: path.resolve(__dirname, "./config/.env") });
require("dotenv").config({
  path: path.resolve(__dirname, "./config/test.env"),
});
require("dotenv").config({ path: path.resolve(__dirname, "./config/dev.env") });

//require("./config/catche")

const app = express();
app.use(compression());
app.use(helmet());

app.use(express.json());
app.use(cors());

//db connection
exports.dbconnection = mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("database connected"));

//middleware
app.use(morgan("dev"));
app.use(cookieParser());

//router
//user
const guest_router = require("./router/guest/guest");
const user_router = require("./router/user/user");
const survey_router = require("./router/user/survey");
const sponsor_router = require("./router/user/sponsor");
const reply_router = require("./router/user/reply");
const mix_router = require("./router/user/mix");
const comment_router = require("./router/user/comment");
const channel_router = require("./router/user/channel");
const article_router = require("./router/user/article");

//admin
const admin_user = require("./router/admin/user");
const admin_channel = require("./router/admin/channel");
const admin_article = require("./router/admin/article");
const admin_comment = require("./router/admin/comment");
const admin_reply = require("./router/admin/reply");
const admin_sponsor = require("./router/admin/sponsor");
const admin_survey = require("./router/admin/survey");
const admin_common = require("./router/admin/common");
const admin_earnings = require("./router/admin/earnings");
const admin_payment = require("./router/admin/payment");
const admin_premium = require("./router/admin/premium");
const admin_publisher = require("./router/admin/publisher");
const admin_task = require("./router/admin/task");
const admin_department = require("./router/admin/department");
const admin_team = require("./router/admin/team");

// const adminRouter = require("./router/admin");
//user
app.use("/api", guest_router);
app.use("/api", user_router);
app.use("/api", survey_router);
app.use("/api", sponsor_router);
app.use("/api", mix_router);
app.use("/api", reply_router);
app.use("/api", article_router);
app.use("/api", channel_router);
app.use("/api", comment_router);
//admin
app.use("/api", admin_user);
app.use("/api", admin_channel);
app.use("/api", admin_article);
app.use("/api", admin_comment);
app.use("/api", admin_reply);
app.use("/api", admin_sponsor);
app.use("/api", admin_survey);
app.use("/api", admin_common);
app.use("/api", admin_earnings);
app.use("/api", admin_payment);
app.use("/api", admin_premium);
app.use("/api", admin_publisher);
app.use("/api", admin_task);
app.use("/api", admin_department);
app.use("/api", admin_team);
module.exports = app;
