// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { setAuthToken, removeAuthToken } from '../utils/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Load user from token
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Set auth token in axios headers
      setAuthToken(token);
      
      // Get user data
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      setUser(null);
      setIsAuthenticated(false);
      removeAuthToken();
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        // Set auth token in axios headers
        setAuthToken(response.data.token);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Navigate to OTP verification
        navigate('/verify-otp', { 
          state: { phoneNumber: userData.phoneNumber }
        });
      }
      
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (verificationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/verify-otp', verificationData);
      
      if (response.data.success) {
        // Update token
        localStorage.setItem('token', response.data.token);
        
        // Set auth token in axios headers
        setAuthToken(response.data.token);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Navigate to home page
        navigate('/');
      }
      
      return response.data;
    } catch (err) {
      console.error('OTP verification error:', err);
      
      setError(
        err.response?.data?.message || 
        'OTP verification failed. Please try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async (phoneNumber) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/resend-otp', { phoneNumber });
      
      return response.data;
    } catch (err) {
      console.error('Resend OTP error:', err);
      
      setError(
        err.response?.data?.message || 
        'Failed to resend OTP. Please try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        // Set auth token in axios headers
        setAuthToken(response.data.token);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Navigate to home page
        navigate('/');
      }
      
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth token from axios headers
    removeAuthToken();
    
    setUser(null);
    setIsAuthenticated(false);
    
    // Navigate to home page
    navigate('/');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/forgot-password', { email });
      
      return response.data;
    } catch (err) {
      console.error('Forgot password error:', err);
      
      setError(
        err.response?.data?.message || 
        'Failed to process forgot password request. Please try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (resetData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/reset-password', resetData);
      
      return response.data;
    } catch (err) {
      console.error('Reset password error:', err);
      
      setError(
        err.response?.data?.message || 
        'Failed to reset password. Please try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/users/profile', profileData);
      
      if (response.data.success) {
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (err) {
      console.error('Update profile error:', err);
      
      setError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/users/password', passwordData);
      
      return response.data;
    } catch (err) {
      console.error('Update password error:', err);
      
      setError(
        err.response?.data?.message || 
        'Failed to update password. Please try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (err) {
      console.error('Upload profile picture error:', err);
      
      setError(
        err.response?.data?.message || 
        'Failed to upload profile picture. Please try again.'
      );
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    loadUser,
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    uploadProfilePicture,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};