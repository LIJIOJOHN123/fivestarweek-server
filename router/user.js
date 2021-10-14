const userRouter = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  updateUserInfo,
  getUserInfo,
  logout,
  logoutAll,
  checkUserExist,
  changeEmail,
  channgePassword,
  getPublicProfile,
  addProfileImage,
  premuiumUser,
  emailVerificationToken,
  emailVerify,
  paymentCallbackAPI,
} = require("../controller/userController");
const { runValidation } = require("../middleware/validatorerror");
const multer = require("multer");
var multerS3 = require("multer-s3");
const {
  createChannel,
  getAllChannels,
  getOneChannel,
  editChannel,
  addChannelImage,
  deleteChannel,
  followChannel,
  unfollowChannel,
  getFollowedChannel,
  getUnfollowedChannel,
  getByIdChannels,
  getChannel,
  channelNameExists,
  getUnfollowedChannelMobile,
  channelViewDetailsAuth,
  channelViewIpDetails,
  channelVisitDetailsAuth,
  channelVisitIpDetails,
} = require("../controller/channelController");
const {
  createArticle,
  getAllArticle,
  likeArticle,
  unlikeArticle,
  getArticlesById,
  getAllArticles,
  getAllArticlesByChannel,
  getArticlesFollowers,
  violationArticle,
  articleViewDetailsAuth,
  articleViewIpDetails,
  homeChannelArticles,
  deleteArticle,
  getMobileFollowingMixed,
  articleVisitDetailsAuth,
  articleVisitIpDetails,
  articleDetailStatitics,
} = require("../controller/articleController");
const {
  addComment,
  getComment,
  getCommentById,
  editCommentById,
  getComments,
  likeComment,
  unlikeComment,
  violationComment,
  getSingleComment,
  deleteComment,
  getCommentsByUser,
  changePublicStatus,
  getPublicCommentByUser,
  getMobileComment,
} = require("../controller/commentController");
const {
  createReply,
  getCommentReply,
  editCommentReply,
  deleteReply,
  violationReply,
  likeReply,
  unlikeReply,
} = require("../controller/replyController");
const { lanagaugelist } = require("../controller/languageConroller");
const {
  generateReferalLink,
  getReferalLink,
  getLinkDetails,
  getEmail,
} = require("../controller/referalController");
const {
  getPaymentDetails,
  addpayment,
} = require("../controller/paymentConroller");
const aws = require("aws-sdk");
const uuid = require("uuid").v4;
const { search, presearch } = require("../controller/searchController");
const {
  getNotification,
  notificationRead,
  notificationAllRead,
} = require("../controller/notificationController");
const mixmiddleware = require("../middleware/mixMiddleware");
const {
  scorelistByUser,
  requestToAddPoints,
} = require("../controller/scoreController");
const {
  addBankDetails,
  earningDetails,
  editBankDetails,
  withdrawEarnings,
} = require("../controller/earningController");
const {
  adduserlocationpreference,
  userpreferencelist,
} = require("../controller/prerenceController");
const {
  channelMiddleware,
  repyMiddleware,
  articleMiddleware,
  commentMiddlware,
} = require("../middleware/formMiddleware");
const {
  createArticleSponsor,
  createChannelSponsor,
  countryList,
  stateList,
  cityList,
  sponsoredUserList,
  sponsoreChannelById,
  sponsoreArticleById,
  forcedChannelSponsor,
  forcedArticleSponsorExit,
  articleSponsorDelete,
  channelSponsorDelete,
} = require("../controller/sponsorController");
const {
  createSurvey,
  deleteSurvey,
  userSurveyList,
  userSurveyApprove,
  userSurveyReject,
  surveyByIdEndUser,
  surveyResponse,
  surveyAccept,
  surveyReturn,
  forcefulExit,
  surveyByIdCreatedUser,
  suveyListEndUser,
  surveyAbandon,
  surveyApproveAll,
} = require("../controller/surveyController");

/******************************** User ******************************/

// @private
userRouter.put("/user", authMiddleware, runValidation, updateUserInfo);
userRouter.patch("/user/userName", authMiddleware, checkUserExist);
userRouter.get("/user", authMiddleware, getUserInfo);
userRouter.post("/logout", authMiddleware, logout);
userRouter.post("/logoutall", authMiddleware, logoutAll);
userRouter.post("/changeemail", authMiddleware, changeEmail);
userRouter.post("/changepassword", authMiddleware, channgePassword);
userRouter.post("/userpremium", authMiddleware, premuiumUser);
userRouter.post("/emailverification", authMiddleware, emailVerificationToken);
userRouter.post("/emailverifyonline", authMiddleware, emailVerify);
userRouter.get("/callback/premium/:id", paymentCallbackAPI);

aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SCECRET_KEY,
  region: process.env.AWS_REGION,
});

const S3 = new aws.S3();

var uploads = multer({
  storage: multerS3({
    size: 3000,
    s3: S3,
    bucket: "testing91081/profile",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      console.log(file);
      const extendname = file.originalname.split(".");
      const fileName = extendname[extendname.length - 1];
      if (fileName === "jpeg" || fileName === "jpg" || fileName === "png") {
        cb(null, uuid() + "." + fileName);
      }
    },
  }),
});
userRouter.post(
  "/profile/uploadone",
  authMiddleware,
  uploads.single("avatar"),
  addProfileImage
);

//public
userRouter.get("/getpublicprofile/:id", authMiddleware, getPublicProfile);
userRouter.post(
  "/userpreference/:id",
  authMiddleware,
  adduserlocationpreference
);

/******************************** Channel  ******************************/

// @privaite
userRouter.post("/channel", authMiddleware, channelMiddleware, createChannel);
userRouter.get("/channel", authMiddleware, getChannel);
userRouter.patch("/channel/:id", authMiddleware, editChannel);
userRouter.put("/channel/:id", authMiddleware, deleteChannel);
userRouter.post("/channel/:id/follow", authMiddleware, followChannel);
userRouter.post("/channel/:id/unfollow", authMiddleware, unfollowChannel);
userRouter.post("/channel/channelname", channelNameExists);

userRouter.get("/nonchannel/followed", authMiddleware, getFollowedChannel);
userRouter.get("/nonchannel/unfollowed", authMiddleware, getUnfollowedChannel);
userRouter.get(
  "/nonchannel/unfollowed/mobile",
  authMiddleware,
  getUnfollowedChannelMobile
);
userRouter.post("/channel/:id/view", authMiddleware, channelViewDetailsAuth);
userRouter.post("/channel/ipview/:id", channelViewIpDetails);
userRouter.post("/channel/:id/visit", authMiddleware, channelVisitDetailsAuth);
userRouter.post("/channel/ipvisitor/:id", channelVisitIpDetails);

//@public
userRouter.get("/channels", getAllChannels);
userRouter.get("/channels/:id", getByIdChannels);
userRouter.get("/channel/:id", authMiddleware, getOneChannel);

/******************************** Article ******************************/

//@private
userRouter.post(
  "/channel/:id/article",
  authMiddleware,
  articleMiddleware,
  createArticle
);
userRouter.get("/channel/:id/article", authMiddleware, getAllArticle);
userRouter.post("/article/:id/like", authMiddleware, likeArticle);
userRouter.post("/article/:id/unlike", authMiddleware, unlikeArticle);
userRouter.get(
  "/ariclechannel/followers",
  authMiddleware,
  getArticlesFollowers
);

userRouter.post("/article/violation/:id", authMiddleware, violationArticle);
userRouter.post("/article/:id/view", authMiddleware, articleViewDetailsAuth);
userRouter.post("/article/ipview/:id", articleViewIpDetails);
userRouter.post("/article/:id/visit", authMiddleware, articleVisitDetailsAuth);
userRouter.post("/article/ipvisitor/:id", articleVisitIpDetails);
userRouter.get("/article/home", homeChannelArticles);
userRouter.post("/articles/delete/:id", authMiddleware, deleteArticle);

//@public
userRouter.get("/articles", getAllArticles);
userRouter.get("/channel/:id/articles", getAllArticlesByChannel);
userRouter.get("/articles/:id", getArticlesById);

/******************************** Comments ******************************/

// @private
userRouter.post(
  "/article/:id/comment",
  authMiddleware,
  commentMiddlware,
  addComment
);
userRouter.get("/comment", authMiddleware, getComment);
userRouter.get("/comment/:id", authMiddleware, getCommentById);
userRouter.put("/comment/:id", authMiddleware, editCommentById);
userRouter.post("/comment/:id/like", authMiddleware, likeComment);
userRouter.post("/comment/:id/unlike", authMiddleware, unlikeComment);
userRouter.post("/comment/violation/:id", authMiddleware, violationComment);
userRouter.post("/comment/block/:id", authMiddleware, deleteComment);
userRouter.get("/comments/user", authMiddleware, getCommentsByUser);
//@public
userRouter.get("/articles/:id/comments", getComments);
userRouter.get("/articlesmobile/:id/comments", getMobileComment);
userRouter.get("/comments/:id", getSingleComment);
userRouter.get("/commentpublicbyuser/:id", getPublicCommentByUser);
userRouter.get("/commentsbyuser", authMiddleware, getCommentsByUser);
userRouter.post("/commentsbyuser/:id", authMiddleware, changePublicStatus);

/******************************** Reply ******************************/
//@private
userRouter.post(
  "/comment/:id/reply",
  repyMiddleware,
  authMiddleware,
  createReply
);
userRouter.put("/reply/:id", authMiddleware, editCommentReply);
userRouter.post("/reply/:id", authMiddleware, deleteReply);
userRouter.post("/reply/violation/:id", authMiddleware, violationReply);
userRouter.post("/reply/:id/like", authMiddleware, likeReply);
userRouter.post("/reply/:id/unlike", authMiddleware, unlikeReply);
userRouter.post("/reply/block/:id", authMiddleware, deleteReply);
//@public
userRouter.get("/comment/:id/reply", getCommentReply);

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
      console.log(fileName);
      if (fileName === "jpeg" || fileName === "jpg" || fileName === "png") {
        cb(null, uuid() + "." + fileName);
      }
    },
  }),
});

//extra

userRouter.post(
  "/channel/upload/:id",
  authMiddleware,
  upload.single("avatar"),
  addChannelImage
);

//Referal
userRouter.post("/refer/link", authMiddleware, generateReferalLink);
userRouter.get("/refer", authMiddleware, getReferalLink);
userRouter.get("/user/transactions", authMiddleware, getPaymentDetails);
userRouter.get("/referbyuser", getLinkDetails);

// Notification
userRouter.get("/user/notification", authMiddleware, getNotification);
userRouter.post("/notification/read/:id", authMiddleware, notificationRead);
userRouter.post("/notification/allread", authMiddleware, notificationAllRead);
//Langauge
userRouter.get("/languages", lanagaugelist);

// mobile
userRouter.get(
  "/mobile/channelfollowingmixed",
  authMiddleware,
  getMobileFollowingMixed
);

//score
userRouter.get("/scorelist", authMiddleware, scorelistByUser);
userRouter.post("/scoresocial", authMiddleware, requestToAddPoints);
userRouter.post("/bankaccount", authMiddleware, addBankDetails);
userRouter.get("/earnings", authMiddleware, earningDetails);
userRouter.put("/earnings", authMiddleware, editBankDetails);
userRouter.post("/withdraw", authMiddleware, withdrawEarnings);

userRouter.get("/user/userpreference", authMiddleware, userpreferencelist);
//search

userRouter.get("/searching", mixmiddleware, search);
userRouter.get("/presearchresult", presearch);

//sponsor
userRouter.get("/sponsoruserlist", authMiddleware, sponsoredUserList);
userRouter.post("/articlesponsor", authMiddleware, createArticleSponsor);

userRouter.post("/channelsponsor", authMiddleware, createChannelSponsor);
userRouter.get("/sponsorechannelbyid/:id", authMiddleware, sponsoreChannelById);
userRouter.post(
  "/forcedchannelsponsorexit/:id",
  authMiddleware,
  forcedChannelSponsor
);
userRouter.post(
  "/forcedarticlesponsorexit/:id",
  authMiddleware,
  forcedArticleSponsorExit
);
userRouter.post(
  "/articlesponosordelete/:id",
  authMiddleware,
  articleSponsorDelete
);
userRouter.post(
  "/channelsponsordelete/:id",
  authMiddleware,
  channelSponsorDelete
);
userRouter.get("/sponsorearticlebyid/:id", authMiddleware, sponsoreArticleById);

userRouter.post("/addpayment", authMiddleware, addpayment);

//suvey
userRouter.post("/surveycreate", authMiddleware, createSurvey);
userRouter.post("/surveydelete/:id", authMiddleware, deleteSurvey);
userRouter.get("/surveylist", authMiddleware, userSurveyList);
userRouter.post(
  "/surveyapprove/:id/:result",
  authMiddleware,
  userSurveyApprove
);
userRouter.post("/surveyreject/:id/:result", authMiddleware, userSurveyReject);
userRouter.get("/surveybyid/:id", authMiddleware, surveyByIdCreatedUser);
userRouter.get("/surveybyidenduser/:id", authMiddleware, surveyByIdEndUser);
userRouter.post("/surveyaccepteligibility/:id", authMiddleware, surveyAccept);
userRouter.post("/surveyresponsoe/:id/:result", authMiddleware, surveyResponse);
userRouter.post("/surveyreturn/:id/:result", authMiddleware, surveyReturn);
userRouter.post("/surveyabandon/:id/:result", authMiddleware, surveyAbandon);
userRouter.post("/surveyapproveall/:id", authMiddleware, surveyApproveAll);
userRouter.post("/surveyexit/:id", authMiddleware, forcefulExit);
userRouter.get("/surveylistenduser", authMiddleware, suveyListEndUser);
userRouter.get("/country", countryList);
userRouter.get("/country/:id", stateList);
userRouter.get("/country/:id/:sid", cityList);
userRouter.post("/sendemailinviation", authMiddleware, getEmail);
userRouter.get("/articlestatics/:id", articleDetailStatitics);

module.exports = userRouter;
