

// server/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { auth } = require('../middleware/auth');

// Get all notifications
router.get('/', auth, notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', auth, notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;