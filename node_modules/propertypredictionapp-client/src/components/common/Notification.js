import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import './Notification.css';

const Notification = () => {
  const { toastNotifications, removeToast } = useNotification();
  
  if (toastNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className="toast-container">
      {toastNotifications.map(toast => (
        <div
          key={toast.id}
          className={`toast-notification toast-${toast.type}`}
        >
          <div className="toast-content">
            <p>{toast.message}</p>
          </div>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;