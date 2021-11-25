const AcitivityHistory = require("../../model/ActivityHistory");
const Payment = require("../../model/Payment");

exports.payment_add = async (req, res) => {
  try {
    const payment = new Payment({
      description: req.body.description,
      type: "Credit",
      amount: req.body.amount,
      user: req.params.id,
    });
    const paymentIndex = await Payment.find({
      user: req.params.id,
    }).countDocuments();
    if (paymentIndex === 0) {
      payment.balance = req.body.amount;
      await payment.save();
    } else {
      const paymentAll = await Payment.find({ user: req.params.id });
      const paymentLast = paymentAll[paymentIndex - 1];
      payment.balance === 0
        ? (payment.balance = req.body.amount)
        : (payment.balance = paymentLast.balance + req.body.amount);
      await payment.save();
    }
    const activity = new AcitivityHistory({
      action: `${req.user.name} added payment of ${req.body.amount}.`,
      user: req.user._id,
      approved: req.user._id,
      type: "payment_manager",
    });
    await activity.save();
    await payment.save();
    res.send(payment);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.payment_remove = async (req, res) => {
  try {
    const payment = new Payment({
      description: req.body.description,
      type: "Debit",
      amount: req.body.amount,
      user: req.params.id,
    });
    const paymentIndex = await Payment.find({
      user: req.params.id,
    }).countDocuments();
    if (paymentIndex === 0) {
      payment.balance = req.body.amount;
      await payment.save();
    } else {
      const paymentAll = await Payment.find({ user: req.params.id });
      const paymentLast = paymentAll[paymentIndex - 1];
      payment.balance === 0
        ? (payment.balance = req.body.amount)
        : (payment.balance = paymentLast.balance - req.body.amount);
      await payment.save();
    }
    const activity = new AcitivityHistory({
      action: `${req.user.name} removed payment of ${req.body.amount}.`,
      user: req.user._id,
      approved: req.user._id,
      type: "payment_manager",
    });
    await activity.save();
    await payment.save();
    res.send(payment);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.payment_list = async (req, res) => {
  try {
    const payment = await Payment.find({ user: req.params.id })
      .sort({
        createdAt: -1,
      })
      .limit(parseInt(req.query.limit));
    res.send({ payment });
  } catch (error) {}
};
