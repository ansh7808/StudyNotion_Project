const Razorpay = require("razorpay");



exports.instance = new Razorpay({
	// key_id: "rzp_test_t4LUM04KXw6wHc",
	// key_secret: "DOdtPrjZRxQejIdj1vAzm0MY",
    key_id: process.env.RAZORPAY_KEY,
	key_secret: process.env.RAZORPAY_SECRET,
});