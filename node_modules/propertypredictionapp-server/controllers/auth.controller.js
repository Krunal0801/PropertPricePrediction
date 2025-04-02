// server/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/Otp');
const config = require('../config/config');
const smsService = require('../services/sms.service');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    // Check if email or phone number already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already in use'
      });
    }

    // Create user without verification initially
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      isVerified: false
    });

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    await OTP.create({
      userId: user._id,
      phoneNumber,
      otp
    });

    // Send OTP via SMS
    try {
      await smsService.sendOTP(phoneNumber, otp);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      // Continue the process even if SMS fails
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your phone number.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      phoneNumber,
      otp,
      isUsed: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update user verification status
    const user = await User.findByIdAndUpdate(
      otpRecord.userId,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update or create new OTP record
    await OTP.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        phoneNumber,
        otp,
        isUsed: false
      },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    try {
      await smsService.sendOTP(phoneNumber, otp);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP in database
    await OTP.create({
      userId: user._id,
      phoneNumber: user.phoneNumber,
      otp
    });

    // Send OTP via SMS
    try {
      await smsService.sendOTP(user.phoneNumber, otp);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your registered phone number'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { phoneNumber, otp, newPassword } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({
      phoneNumber,
      otp,
      isUsed: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Find user and update password
    const user = await User.findById(otpRecord.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};