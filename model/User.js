const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppConstant = require("../config/appConstants");
const { isEmail } = require("validator");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userId: {
      type: String,
    },
    name: {
      type: String,
    },
    userName: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [isEmail, "invalid email"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isAd: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumType: {
      type: Number,
      default: AppConstant.PREMIUM_TYPE.NORMAL,
      enum: [
        AppConstant.PREMIUM_TYPE.NORMAL,
        AppConstant.PREMIUM_TYPE.SILVER,
        AppConstant.PREMIUM_TYPE.GOLD,
        AppConstant.PREMIUM_TYPE.DIAMOND,
      ],
    },
    emailOTP: {
      type: Number,
    },
    premiumDate: {
      type: String,
    },
    userDocumentVerfication: {
      type: Number,
      default: AppConstant.USER_DOCUMENT_VERIFICATION.REGISTED,
      enum: [
        AppConstant.USER_DOCUMENT_VERIFICATION.REGISTED,
        AppConstant.USER_DOCUMENT_VERIFICATION.SUBMITTED,
        AppConstant.USER_DOCUMENT_VERIFICATION.APPROVED,
        AppConstant.USER_DOCUMENT_VERIFICATION.REJECTED,
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    language: { type: String, default: process.env.LANGUAGE_NAME },
    avatar: {
      image: {
        type: String,
        default: process.env.PROFIE_AVATAR,
      },
      zoom: {
        type: Number,
        default: 100,
      },
    },
    avatars: [
      {
        image: {
          type: String,
          default: process.env.PROFIE_AVATAR,
        },
        zoom: {
          type: String,
          default: "100%",
        },
      },
    ],
    mobile: {
      type: String,
      default: "9108167660",
    },
    phoneCode: {
      type: String,
      default: "91",
    },
    resetPassword: {
      type: String,
    },
    status: {
      type: Number,
      default: AppConstant.USER_STATUS.ACTIVE,
      enum: [AppConstant.USER_STATUS.ACTIVE, AppConstant.USER_STATUS.BLOCKED],
    },
    roles: [
      {
        type: Number,
        default: AppConstant.USER_ROLE.USER,
      },
    ],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
UserSchema.pre("save", async function (next) {
  //encrypt password
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  // email small letter
  user.email = user.email.toLowerCase();
  next();
});

//generate token for authentication
UserSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    AppConstant.JWT_VARIABLE
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
//hide password and tokens array
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.resetPassword;
  delete userObject.roles;
  delete userObject.emailOTP;
  return userObject;
};
const User = mongoose.model("User", UserSchema);

module.exports = User;
