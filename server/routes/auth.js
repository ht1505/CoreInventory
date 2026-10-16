const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, login, forgotPasswordSendOtp, forgotPasswordVerifyOtp } = require('../controllers/auth');



router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPasswordSendOtp);
router.post('/reset-password',  forgotPasswordVerifyOtp);

module.exports = router;