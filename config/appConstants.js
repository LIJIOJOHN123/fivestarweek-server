class AppConstant {
  //jwt varialbe
  static JWT_VARIABLE = "iamvalueable";

  //user
  static USER_ROLE = {
    USER: 0,
    ADMIN: 1,
  };

  static USER_STATUS = {
    ACTIVE: 1,
    BLOCKED: 2,
  };

  static USER_DOCUMENT_VERIFICATION = {
    REGISTED: 0,
    SUBMITTED: 1,
    APPROVED: 2,
    REJECTED: 3,
  };
  //channel
  static CHANNEL_STATUS = {
    ACTIVE: 1,
    BLOCKED: 2,
  };
  // channel Verification
  static CHANNEL_VERIFICATION = {
    NORMAL: 1,
    VERIFIED: 2,
  };
  //article
  static ARTICLE_STATUS = {
    ACTIVE: 1,
    BLOCKED: 2,
  };
  static SPONSOR = {
    NORMAL: 1,
    REQUEST_PENDING: 2,
    SPONSORED: 3,
    REJECTED: 4,
    BLOCK: 5,
    COMPLETED: 6,
  };

  static COMMENT_STATUS = {
    ACTIVE: 1,
    BLOCKED: 2,
  };

  static REPLY_STATUS = {
    ACTIVE: 1,
    BLOCKED: 2,
  };
  static PUBLISHER_STATUS = {
    NORMAL: 0,
    HOME: 1,
    BLOCKED: 2,
  };

  static KEYWORDS = {
    ACTIVE: 0,
    STAR: 1,
    BLOCK: 2,
  };
  static NOTFICATION = {
    UNREAD: 0,
    READ: 1,
  };

  static SEARCH_STATUS = {
    POPULAR: 0,
    NORMAL: 1,
    WASTE: 2,
  };
  static SURVEY_STATUS = {
    APPROVE: 1,
    REJECT: 2,
    PENDING: 4,
    COMPLETED: 5,
    BLOCK: 6,
  };
  static SURVEY_ANSWER_STATUS = {
    APPROVE: 1,
    REJECT: 2,
    PENDING: 3,
  };
  static SURVEY_RESULT_STATUS = {
    ACCEPT: 1,
    SKIP: 2,
    RETURN: 3,
    SUBMIT: 4,
    ABANDON: 5,
  };
  static PREMIUM_TYPE = {
    NORMAL: 0,
    SILVER: 1,
    GOLD: 2,
    DIAMOND: 3,
  };
  static PREMIUM_SELLER = {
    NOT_PAID: 0,
    PENDING: 1,
    APPROVED: 2,
    PAID: 3,
  };
  static PREMIUM_USER_TYPE = {
    NEW: 1,
    UPGRADE: 2,
  };
}
module.exports = AppConstant;
