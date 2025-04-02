// server/controllers/user.controller.js
const User = require('../models/User');
const Property = require('../models/Property');
const UserPreference = require('../models/UserPreference');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', config.upload.profilePicturePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + extname);
  }
});

// File filter for profile pictures
const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Initialize multer upload
exports.upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter
});

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('bookmarkedProperties');

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
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber } = req.body;
    
    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }
    
    // Check if phone number already exists for another user
    if (phoneNumber) {
      const existingUser = await User.findOne({ phoneNumber, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
    }
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName: fullName || undefined,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if current password is correct
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Get relative path to save in database
    const relativePath = path.join(config.upload.profilePicturePath, req.file.filename).replace(/\\/g, '/');
    
    // Update user profile picture
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: relativePath },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

// Get search history
exports.getSearchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('searchHistory');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Sort search history by timestamp (newest first)
    const searchHistory = user.searchHistory.sort((a, b) => b.timestamp - a.timestamp);
    
    res.status(200).json({
      success: true,
      searchHistory
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search history',
      error: error.message
    });
  }
};

// Delete search history item
exports.deleteSearchHistoryItem = async (req, res) => {
  try {
    const { historyId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove search history item
    user.searchHistory = user.searchHistory.filter(
      item => item._id.toString() !== historyId
    );
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Search history item deleted successfully'
    });
  } catch (error) {
    console.error('Delete search history item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete search history item',
      error: error.message
    });
  }
};

// Clear all search history
exports.clearSearchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Clear search history
    user.searchHistory = [];
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Search history cleared successfully'
    });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear search history',
      error: error.message
    });
  }
};

// Bookmark a property
exports.bookmarkProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if property is already bookmarked
    if (user.bookmarkedProperties.includes(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Property already bookmarked'
      });
    }
    
    // Add property to bookmarks
    user.bookmarkedProperties.push(propertyId);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Property bookmarked successfully'
    });
  } catch (error) {
    console.error('Bookmark property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark property',
      error: error.message
    });
  }
};

// Remove bookmark
exports.removeBookmark = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove property from bookmarks
    user.bookmarkedProperties = user.bookmarkedProperties.filter(
      id => id.toString() !== propertyId
    );
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark',
      error: error.message
    });
  }
};

// Get bookmarked properties
exports.getBookmarkedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarkedProperties');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      bookmarkedProperties: user.bookmarkedProperties
    });
  } catch (error) {
    console.error('Get bookmarked properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmarked properties',
      error: error.message
    });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const {
      preferredLocations,
      preferredPropertyTypes,
      preferredBedrooms,
      priceRange,
      areaRange,
      preferredAmenities
    } = req.body;
    
    // Find existing preferences or create new one
    let userPreference = await UserPreference.findOne({ user: req.user.id });
    
    if (!userPreference) {
      userPreference = new UserPreference({
        user: req.user.id
      });
    }
    
    // Update fields if provided
    if (preferredLocations) userPreference.preferredLocations = preferredLocations;
    if (preferredPropertyTypes) userPreference.preferredPropertyTypes = preferredPropertyTypes;
    if (preferredBedrooms) userPreference.preferredBedrooms = preferredBedrooms;
    if (priceRange) userPreference.priceRange = priceRange;
    if (areaRange) userPreference.areaRange = areaRange;
    if (preferredAmenities) userPreference.preferredAmenities = preferredAmenities;
    
    userPreference.lastUpdated = Date.now();
    
    await userPreference.save();
    
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: userPreference
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    const userPreference = await UserPreference.findOne({ user: req.user.id });
    
    if (!userPreference) {
      return res.status(404).json({
        success: false,
        message: 'No preferences found'
      });
    }
    
    res.status(200).json({
      success: true,
      preferences: userPreference
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
};