// client/src/context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotifications, setToastNotifications] = useState([]);
  const { isAuthenticated } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get('/notifications');
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
        
        // Count unread notifications
        const unread = response.data.notifications.filter(notification => !notification.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await api.put('/notifications/read-all');
      
      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, isRead: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      if (response.data.success) {
        // Update local state
        const updatedNotifications = notifications.filter(
          notification => notification._id !== notificationId
        );
        
        setNotifications(updatedNotifications);
        
        // Update unread count if the deleted notification was unread
        const wasUnread = notifications.find(
          notification => notification._id === notificationId && !notification.isRead
        );
        
        if (wasUnread) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Show toast notification
  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    
    // Add new toast notification
    setToastNotifications(prev => [
      ...prev,
      { id, message, type, duration }
    ]);
    
    // Remove toast after duration
    setTimeout(() => {
      setToastNotifications(prev => 
        prev.filter(toast => toast.id !== id)
      );
    }, duration);
    
    return id;
  };

  // Remove toast notification
  const removeToast = (id) => {
    setToastNotifications(prev => 
      prev.filter(toast => toast.id !== id)
    );
  };

  // Fetch notifications when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Set up periodic polling (every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Context value
  const value = {
    notifications,
    unreadCount,
    toastNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showToast,
    removeToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};