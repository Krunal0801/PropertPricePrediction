
// client/src/pages/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { validatePassword, validateOTP } from '../utils/validation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword, loading, error, clearError } = useAuth();
  const { showToast } = useNotification();
  
  // Get phone number from query params
  const queryParams = new URLSearchParams(location.search);
  const phoneNumber = queryParams.get('phone');
  
  // Redirect if phone number is not provided
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/forgot-password');
    }
  }, [phoneNumber, navigate]);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [error, showToast, clearError]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!validateOTP(formData.otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'Password must be at least 6 characters with at least one uppercase, one lowercase and one number';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For OTP, allow only digits and max 6 characters
    if (name === 'otp' && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await resetPassword({
          phoneNumber,
          otp: formData.otp,
          newPassword: formData.newPassword
        });
        
        setIsSubmitted(true);
        showToast('Password reset successfully', 'success');
      } catch (error) {
        // Error is handled by auth context
      }
    }
  };
  
  if (loading) {
    return <LoadingSpinner size="large" />;
  }
  
  return (
    <div className="auth-page reset-password-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Reset Password</h1>
          
          {isSubmitted ? (
            <div className="success-message">
              <p>Your password has been reset successfully!</p>
              <div className="auth-links">
                <Link to="/login" className="btn-primary auth-button">
                  Login with New Password
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="auth-subtitle">
                Enter the OTP sent to your phone and create a new password.
              </p>
              
              <div className="phone-display">
                <strong>Phone Number:</strong> {phoneNumber}
              </div>
              
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="otp">One-Time Password (OTP)</label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  {errors.otp && <div className="error-message">{errors.otp}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    placeholder="Create new password"
                  />
                  {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
                
                <button type="submit" className="btn-primary auth-button" disabled={loading}>
                  {loading ? <LoadingSpinner size="small" /> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
