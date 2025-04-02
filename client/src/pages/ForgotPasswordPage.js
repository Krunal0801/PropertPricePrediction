import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { validateEmail } from '../utils/validation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { forgotPassword, loading, error, clearError } = useAuth();
  const { showToast } = useNotification();
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [error, showToast, clearError]);
  
  const validateForm = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    
    setEmailError('');
    return true;
  };
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    
    if (emailError) {
      setEmailError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await forgotPassword(email);
        setIsSubmitted(true);
        showToast('Password reset instructions sent to your email', 'success');
      } catch (error) {
        // Error is handled by auth context
      }
    }
  };
  
  if (loading) {
    return <LoadingSpinner size="large" />;
  }
  
  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Forgot Password</h1>
          
          {isSubmitted ? (
            <div className="success-message">
              <p>
                We've sent password reset instructions to your email address. Please check your inbox.
              </p>
              <p>
                If you don't receive an email within a few minutes, please check your spam folder.
              </p>
              <div className="auth-links">
                <Link to="/login" className="btn-primary auth-button">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="auth-subtitle">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                    placeholder="Enter your email"
                  />
                  {emailError && <div className="error-message">{emailError}</div>}
                </div>
                
                <button type="submit" className="btn-primary auth-button" disabled={loading}>
                  {loading ? <LoadingSpinner size="small" /> : 'Send Reset Instructions'}
                </button>
              </form>
              
              <div className="auth-links">
                <p>
                  Remember your password?{' '}
                  <Link to="/login" className="auth-link">Login</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
