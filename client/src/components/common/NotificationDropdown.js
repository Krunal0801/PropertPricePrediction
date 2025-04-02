import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/format';
import './NotificationDropdown.css';

const NotificationDropdown = ({ count }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotification();
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteNotification(id);
  };
  
  return (
    <div className="notification-dropdown">
      <button 
        className="notification-button" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {count > 0 && <span className="notification-badge">{count}</span>}
      </button>
      
      {isOpen && (
        <div className="notification-menu">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                className="mark-all-read-button"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <button
                    className="notification-delete"
                    onClick={(e) => handleDelete(notification._id, e)}
                    aria-label="Delete notification"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 5 && (
            <div className="notification-footer">
              <Link to="/notifications" className="view-all-button">
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;