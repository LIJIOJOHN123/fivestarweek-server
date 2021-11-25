const AcitivityHistory = require("../../model/ActivityHistory");
const Earning = require("../../model/Earning");

exports.earnings_list = async (req, res) => {
  try {
    const earningsList = await Earning.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    res.send({ earningsList });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.earnings_add = async (req, res) => {
  try {
    const earn = await Earning.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    if (earn) {
      let totals = parseInt(earn.balance) + parseInt(req.body.amount);
      const newpayment = {
        user: req.params.id,
        type: "Credit",
        description: req.body.description,
        amount: req.body.amount,
        status: true,
        balance: totals,
      };
      const earnings = new Earning(newpayment);
      await earnings.save();
      res.send(earnings);
    } else {
      const newpayments = {
        user: req.params.id,
        type: "Credit",
        description: req.body.description,
        amount: req.body.amount,
        status: true,
        balance: req.body.amount,
      };
      const earning = new Earning(newpayments);
      const activity = new AcitivityHistory({
        action: `${req.user.name} added earnings of ${req.body.amount}.`,
        user: req.user._id,
        approved: req.user._id,
        type: "earnings_manager",
      });
      await activity.save();
      await earning.save();
      res.send(earning);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.earnings_remove = async (req, res) => {
  try {
    const earn = await Earning.findOne({ user: req.params.id }).sort({
      createdAt: -1,
    });
    let totals = parseInt(earn.balance) - parseInt(req.body.amount);
    const newpayment = {
      user: req.body.user,
      type: "Debit",
      description: req.body.description,
      amount: req.body.amount,
      status: true,
      balance: totals,
    };
    const earning = new Earning(newpayment);
    const activity = new AcitivityHistory({
      action: `${req.user.name} removed earnings of ${req.body.amount}.`,
      user: req.user._id,
      approved: req.user._id,
      type: "earnings_manager",
    });
    await activity.save();
    await earning.save();
    res.send(earning);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.earnings_withdraw_list = async (req, res) => {
  try {
    const withdrawal = await Earning.find({ type: "Debit", status: true }).sort(
      { createdAt: -1 }
    );
    res.send({ withdrawal });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.earnings_withdraw_approval = async (req, res) => {
  try {
    const withdrawal = await Earning.findOne({
      type: "Debit",
      status: true,
      _id: req.params.id,
    });
    withdrawal.status = false;
    const activity = new AcitivityHistory({
      action: `${req.user.name} approved withdwal of ${withdrawal.amount}.`,
      user: req.user._id,
      approved: req.user._id,
      type: "earnings_manager",
    });
    await activity.save();
    await withdrawal.save();
    res.send({ withdrawal });
  } catch (error) {
    res.status(500).send(error);
  }
};
