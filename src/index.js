const Razorpay = require("razorpay");

module.exports = async function (req, res) {
    try {
        const { amount } = JSON.parse(req.payload);

        if (!amount) {
            return res.json({ success: false, message: "amount required" });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: amount * 100, // INR → paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        return res.json({ success: true, order });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};
