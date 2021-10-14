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
const guestRouter = require("./router/guest");
const userRouter = require("./router/user");
const adminRouter = require("./router/admin");

app.use("/api", guestRouter);
app.use("/api", userRouter);
app.use("/api", adminRouter);

module.exports = app;
