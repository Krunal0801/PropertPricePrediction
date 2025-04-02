// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// Middleware to authenticate JWT token
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user by id
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    // Set user in request object
    req.user = {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
      error: error.message
    });
  }
};

// Middleware to check if user is verified
exports.verifiedUser = async (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account not verified, please verify your account first'
    });
  }

  next();
};

// Optional authentication middleware
// This allows both authenticated and non-authenticated users
// If authenticated, user info will be available in req.user
exports.optionalAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Find user by id
      const user = await User.findById(decoded.id);

      if (user) {
        // Set user in request object
        req.user = {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    console.warn('Optional authentication failed:', error.message);
    next();
  }
};