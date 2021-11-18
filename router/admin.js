const adminRouter = require("express").Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  blockUser,
  unblockUser,
  blockArticles,
  unBlockArticles,
  blockChannels,
  unBlockChannels,
  blockComment,
  unBlockComment,
  getViolatedArticles,
  getViolatedComments,
  getViolatedReply,
  publisherApprove,
  channelList,
  articleList,
  publisherList,
  addPayment,
  getAllPayment,
  addVerfication,
  removeVerification,
  commentList,
  unBlockReply,
  replyList,
  blockReply,
  addLanguage,
  addEarning,
  removeEarning,
  removePayment,
  approveMarketingRequest,
  scorependinglist,
  withdrawalList,
  withdrawalApprove,
  earningList,
  addChannelDetails,
  userSearch,
  channelSearch,
  articleSearch,
  commentSearch,
  replySearch,
  scoreList,
  addScore,
  removeScore,
  sponsorApprovePendingList,
  sponsorApproveArticle,
  sponsorRejectArticle,
  sponsorRejectChannel,
  sponsoredArticleList,
  sponsoredChannelList,
  sponsorApproveChannel,
  editChannelSponsore,
  editArticleSponsore,
  surveyList,
  surveyApprove,
  surveyReject,
  sponsoreChannelByIdAdmin,
  sponsoreArticleByIdAdmin,
  surveyApproveAllAdmin,
  forcefulExitAdminSurvey,
  forcedArticleSponsorExitAdmin,
  forcedChannelSponsorAdmin,
  channelAddInfo,
  premiumUserList,
  premuiumUserApprove,
  approvePaymetStatus,
} = require("../controller/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  languageCreates,
  countryListAdd,
} = require("../controller/dataController");

adminRouter.get("/admin/users", adminMiddleware, getAllUsers);

/********* User managment *******/
adminRouter.post("/admin/blockuser/:id", adminMiddleware, blockUser);
adminRouter.post("/admin/unblockuser/:id", adminMiddleware, unblockUser);

/********* Channel managment *******/
adminRouter.get("/admin/channels", adminMiddleware, channelList);
adminRouter.post("/admin/blockchannel/:id", adminMiddleware, blockChannels);
adminRouter.post("/admin/unblockchannel/:id", adminMiddleware, unBlockChannels);
adminRouter.post(
  "/admin/addchanneldetails/:id",
  adminMiddleware,
  channelAddInfo
);

adminRouter.post(
  "/admin/channel/verification/:id",
  adminMiddleware,
  addVerfication
);
adminRouter.post(
  "/admin/channel/removeverification/:id",
  adminMiddleware,
  removeVerification
);
adminRouter.post(
  "/admin/addchanneldetails/:id",
  adminMiddleware,
  addChannelDetails
);

/********* Article managment *******/
adminRouter.get("/admin/articles", adminMiddleware, articleList);
adminRouter.post("/admin/blockarticle/:id", adminMiddleware, blockArticles);
adminRouter.post("/admin/unblockarticle/:id", adminMiddleware, unBlockArticles);

adminRouter.get("/admin/violationarticle", getViolatedArticles);

/********* Comment managment *******/
adminRouter.get("/admin/violationcomments", getViolatedComments);
adminRouter.post("/admin/blockcomment/:id", adminMiddleware, blockComment);
adminRouter.post("/admin/unblockcomment/:id", adminMiddleware, unBlockComment);
adminRouter.get("/admin/commentlist", adminMiddleware, commentList);

/********* Reply managment *******/
adminRouter.get("/admin/replylist", adminMiddleware, replyList);
adminRouter.post("/admin/blockreply/:id", adminMiddleware, blockReply);
adminRouter.post("/admin/unblockreply/:id", adminMiddleware, unBlockReply);
adminRouter.get("/admin/replyviolationlist", adminMiddleware, getViolatedReply);

/********* Plublisher managment *******/

adminRouter.get("/admin/publishers", adminMiddleware, publisherList);
adminRouter.post("/admin/publsher/:id", adminMiddleware, publisherApprove);

/********* Category managment *******/

adminRouter.post("/admin/addlanguage", adminMiddleware, addLanguage);

// payment
adminRouter.post("/admin/addpayment/:id", authMiddleware, addPayment);
adminRouter.post("/admin/removepayment/:id", authMiddleware, removePayment);
adminRouter.get("/admin/paymentlist/:id", adminMiddleware, getAllPayment);

//earnings
adminRouter.post("/admin/addearning/:id", adminMiddleware, addEarning);
adminRouter.post("/admin/removeearning/:id", adminMiddleware, removeEarning);
adminRouter.get("/admin/withdrawallist", adminMiddleware, withdrawalList);
adminRouter.post(
  "/admin/approvewithdrawal/:id",
  adminMiddleware,
  withdrawalApprove
);
adminRouter.get("/admin/earninglist/:id", adminMiddleware, earningList);

//score
adminRouter.post(
  "/admin/approverequest/:id",
  adminMiddleware,
  approveMarketingRequest
);
adminRouter.get("/admin/pendingapprovelist", adminMiddleware, scorependinglist);
adminRouter.post("/admin/scoreadd/:id", adminMiddleware, addScore);
adminRouter.post("/admin/scoreremove/:id", adminMiddleware, removeScore);
adminRouter.get("/adminscorelist/:id", adminMiddleware, scoreList);
//scorelist

//search
adminRouter.get("/admin/usersearch", userSearch);
adminRouter.get("/admin/channelsearch", adminMiddleware, channelSearch);
adminRouter.get("/admin/articlesearch", adminMiddleware, articleSearch);
adminRouter.get("/admin/commentsearch", adminMiddleware, commentSearch);
adminRouter.get("/admin/replysearch", adminMiddleware, replySearch);

//sponore
adminRouter.get(
  "/admin/sponsorpendinglist",
  adminMiddleware,
  sponsorApprovePendingList
);
adminRouter.post(
  "/admin/articleapprove/:id",
  adminMiddleware,
  sponsorApproveArticle
);
adminRouter.post(
  "/admin/channelapprove/:id",
  adminMiddleware,
  sponsorApproveChannel
);
adminRouter.post(
  "/admin/articlereject/:id",
  adminMiddleware,
  sponsorRejectArticle
);
adminRouter.post(
  "/admin/channelreject/:id",
  adminMiddleware,
  sponsorRejectChannel
);
adminRouter.get(
  "/admin/sponsorelistsarticles",
  adminMiddleware,
  sponsoredArticleList
);
adminRouter.get(
  "/admin/sponsorelistschannels",
  adminMiddleware,
  sponsoredChannelList
);
adminRouter.post(
  "/admin/channelsponsoredit/:id",
  adminMiddleware,
  editChannelSponsore
);
adminRouter.post(
  "/admin/articlesponsoredit/:id",
  adminMiddleware,
  editArticleSponsore
);
adminRouter.post(
  "/admin/articlesponsoreexit/:id",
  adminMiddleware,
  forcedArticleSponsorExitAdmin
);
adminRouter.post(
  "/admin/channelsponsoreexit/:id",
  adminMiddleware,
  forcedChannelSponsorAdmin
);
adminRouter.get(
  "/admin/channelsponsorid/:id",
  adminMiddleware,
  sponsoreChannelByIdAdmin
);
adminRouter.get(
  "/admin/articlesponsorid/:id",
  adminMiddleware,
  sponsoreArticleByIdAdmin
);
//temporary data
adminRouter.post("/counry", countryListAdd);
adminRouter.post("/language", languageCreates);
//admin
adminRouter.get("/adminsurveylist", adminMiddleware, surveyList);
adminRouter.post("/adminsurveyapprove/:id", adminMiddleware, surveyApprove);
adminRouter.post("/adminsurveyreject/:id", adminMiddleware, surveyReject);
adminRouter.post(
  "/adminsurveyapproveall",
  adminMiddleware,
  surveyApproveAllAdmin
);
adminRouter.post(
  "/surveyadminforcedexit/:id",
  adminMiddleware,
  forcefulExitAdminSurvey
);

adminRouter.get("/premieruserlist", adminMiddleware, premiumUserList);
adminRouter.post(
  "/premieruserlistapprove",
  adminMiddleware,
  premuiumUserApprove
);
adminRouter.post(
  "/premieruserlistapprovepayment",
  adminMiddleware,
  approvePaymetStatus
);

module.exports = adminRouter;

//premium user list
//premium user approve
// premium  payment approve
