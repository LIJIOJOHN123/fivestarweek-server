const Bank = require("../model/Bank");
const Earning = require("../model/Earning");

exports.addBankDetails = async (req, res) => {
  try {
    const bankaccount = new Bank({
      user: req.user._id,
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      IFSC: req.body.IFSC,
      accountHolderName: req.body.accountHolderName,
      UPI: req.body.UPI,
      payPal: req.body.payPal,
      preference: req.body.preference,
    });
    await bankaccount.save();
    res.send(bankaccount);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.earningDetails = async (req, res) => {
  try {
    const earningCount = await Earning.find({
      user: req.user._id,
    }).countDocuments();
    const earnings = await Earning.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    const bank = await Bank.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.send({ earnings, bank, earningCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.editBankDetails = async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const earning = await Bank.findOne({ user: req.user._id });
    await updates.map((update) => (earning[update] = req.body[update]));
    await earning.save();
    res.send(earning);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.withdrawEarnings = async (req, res) => {
  try {
    const earn = await Earning.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const newpayment = {
      user: req.user._id,
      type: "Debit",
      description: req.body.description,
      amount: req.body.amount,
      status: false,
      balance: earn.balance,
    };
    const newEarn = new Earning(newpayment);
    await newEarn.save();
    res.send(newEarn);
  } catch (error) {
    res.status(500).send(error);
  }
};
