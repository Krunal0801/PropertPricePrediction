// server/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, verifiedUser } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, verifiedUser, userController.updateProfile);

// Update password
router.put('/password', auth, verifiedUser, userController.updatePassword);

// Upload profile picture
router.post('/profile-picture', auth, verifiedUser, userController.upload.single('profilePicture'), userController.uploadProfilePicture);

// Get search history
router.get('/search-history', auth, userController.getSearchHistory);

// Delete search history item
router.delete('/search-history/:historyId', auth, userController.deleteSearchHistoryItem);

// Clear all search history
router.delete('/search-history', auth, userController.clearSearchHistory);

// Bookmark a property
router.post('/bookmarks', auth, verifiedUser, userController.bookmarkProperty);

// Remove bookmark
router.delete('/bookmarks/:propertyId', auth, verifiedUser, userController.removeBookmark);

// Get bookmarked properties
router.get('/bookmarks', auth, userController.getBookmarkedProperties);

// Update user preferences
router.put('/preferences', auth, userController.updatePreferences);

// Get user preferences
router.get('/preferences', auth, userController.getPreferences);

module.exports = router;