const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['property_update', 'system', 'feature', 'promotion'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedProperty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;