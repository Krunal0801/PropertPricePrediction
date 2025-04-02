// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

// Register user
router.post('/register', authController.register);

// Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Resend OTP
router.post('/resend-otp', authController.resendOTP);

// Login user
router.post('/login', authController.login);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;



