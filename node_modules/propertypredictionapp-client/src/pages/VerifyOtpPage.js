
// client/src/pages/VerifyOtpPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { validateOTP } from '../utils/validation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AuthPages.css';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP, loading, error, clearError, isAuthenticated, user } = useAuth();
  const { showToast } = useNotification();
  
  // Get phone number from location state
  const phoneNumber = location.state?.phoneNumber;
  
  // Redirect if not coming from the register page or already verified
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/login');
    }
    
    if (isAuthenticated && user?.isVerified) {
      navigate('/');
    }
  }, [phoneNumber, navigate, isAuthenticated, user]);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [error, showToast, clearError]);
  
  // Countdown for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);
  
  const validateForm = () => {
    if (!otp.trim()) {
      setOtpError('OTP is required');
      return false;
    }
    
    if (!validateOTP(otp)) {
      setOtpError('OTP must be 6 digits');
      return false;
    }
    
    setOtpError('');
    return true;
  };
  
  const handleOtpChange = (e) => {
    const value = e.target.value;
    
    // Allow only digits and max 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      
      if (otpError) {
        setOtpError('');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await verifyOTP({ phoneNumber, otp });
        showToast('Phone number verified successfully', 'success');
      } catch (error) {
        // Error is handled by auth context
      }
    }
  };
  
  const handleResendOtp = async () => {
    if (canResend) {
      try {
        await resendOTP(phoneNumber);
        showToast('OTP resent successfully', 'success');
        setCountdown(30);
        setCanResend(false);
      } catch (error) {
        // Error is handled by auth context
      }
    }
  };
  
  if (loading) {
    return <LoadingSpinner size="large" />;
  }
  
  return (
    <div className="auth-page verify-otp-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Verify OTP</h1>
          <p className="auth-subtitle">
            We've sent a verification code to your phone number. Please enter the code below.
          </p>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="phone-display">
              <strong>Phone Number:</strong> {phoneNumber}
            </div>
            
            <div className="form-group">
              <label htmlFor="otp">One-Time Password (OTP)</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                className={`form-control ${otpError ? 'is-invalid' : ''}`}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
              />
              {otpError && <div className="error-message">{otpError}</div>}
            </div>
            
            <button type="submit" className="btn-primary auth-button" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Verify OTP'}
            </button>
          </form>
          
          <div className="resend-otp">
            {canResend ? (
              <button 
                onClick={handleResendOtp} 
                className="resend-button"
                disabled={loading}
              >
                Resend OTP
              </button>
            ) : (
              <p>Resend OTP in {countdown} seconds</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;