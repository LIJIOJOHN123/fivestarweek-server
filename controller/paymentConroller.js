const Payment = require("../model/Payment");
var Insta = require("instamojo-nodejs");

exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).send({ payment });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.addpayment = async (req, res) => {
  try {
    Insta.setKeys(process.env.PAYMENT_API_KEY, process.env.PAYMENT_AUTH_KEY);
    var data = new Insta.PaymentData();
    Insta.isSandboxMode(true);
    data.purpose = req.body.purpose;
    data.amount = req.body.amount;
    data.buyer_name = req.user.name;
    data.redirect_url = req.body.redirect_url;
    data.email = req.user.email;
    data.phone = req.user.mobile;
    data.send_email = false;
    data.webhook = "https://www.youtube.com/";
    data.send_sms = false;
    data.allow_repeated_payment = false;
    data.customer_id = req.user._id;

    Insta.createPayment(data, async (error, response) => {
      if (error) {
        // some error
      } else {
        // Payment redirection link at response.payment_request.longurl
        const responseData = JSON.parse(response);
        const payment = new Payment({
          description: "Amount is added to account",
          type: "Credit",
          amount: req.body.amount,
          user: req.user._id,
        });
        const paymentLast = await Payment.findOne({
          user: req.user._id,
        }).sort({ createdAt: -1 });
        payment.balance =
          parseInt(paymentLast.balance) + parseInt(req.body.amount);
        await payment.save();
        await req.user.save();
        const redirectUrl = responseData.payment_request.longurl;
        res.send(redirectUrl);
      }
    });
  } catch (error) {}
};
