const { check } = require("express-validator");

exports.register_middleware = [
  check("name", "Name required").not().isEmpty(),
  check("email", "Email required").not().isEmpty(),
  check("password", "Password required").not().isEmpty(),
  check("name", "Name should contain minimum 4 charactor").isLength({ min: 4 }),
  check("name", "Name should not contain maximum 30 charactor").isLength({
    max: 30,
  }),
  check("password", "Password should contain minimum 6 charactor").isLength({
    min: 6,
  }),
  check("email", "Email should contain minimum 4 charactor").isLength({
    min: 4,
  }),
];

exports.login_middlware = [
  check("password", "Password required").not().isEmpty(),
];

exports.channel_middleware = [
  check("channel", "Channel required").not().isEmpty(),
  check("channelName", "Channel Name  required").not().isEmpty(),
  check("keywords", "Atleast one keyword required").not().isEmpty(),
  check("channel", "Name should contain minmum 4 charactor").isLength({
    min: 4,
  }),
  check("channelName", "Name should contain minmum 4 charactor").isLength({
    min: 4,
  }),
];

exports.reply_middleware = [check("reply", "Reply required").not().isEmpty()];

exports.comment_middlware = [
  check("comment", "Comment required").not().isEmpty(),
];

exports.article_middleware = [check("link", "Link required").not().isEmpty()];

exports.forgot_password_validator = [
  check("email", "Email required").not().isEmpty(),
];
exports.reset_password_validator = [
  check("password", "Password required").not().isEmpty(),
];
