import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getProfile, updateProfile, uploadProfilePicture, getSearchHistory, deleteSearchHistoryItem, clearSearchHistory } from '../services/user.service';
import { formatRelativeTime } from '../utils/format';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { user, updateProfile: authUpdateProfile } = useAuth();
  const { showToast } = useNotification();
  
  // Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        const response = await getProfile();
        
        if (response.success) {
          setProfileData({
            fullName: response.user.fullName || '',
            email: response.user.email || '',
            phoneNumber: response.user.phoneNumber || ''
          });
          
          // Set profile picture
          if (response.user.profilePicture) {
            setPreviewImage(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${response.user.profilePicture}`);
          }
        } else {
          showToast('Failed to fetch profile data', 'error');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast('Failed to fetch profile data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [showToast]);
  
  // Load search history when switching to the history tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchSearchHistory();
    }
  }, [activeTab]);
  
  // Fetch search history
  const fetchSearchHistory = async () => {
    try {
      setLoading(true);
      
      const response = await getSearchHistory();
      
      if (response.success) {
        setSearchHistory(response.searchHistory);
      } else {
        showToast('Failed to fetch search history', 'error');
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
      showToast('Failed to fetch search history', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!profileData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number should be 10 digits starting with 6-9';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      
      const response = await updateProfile(profileData);
      
      if (response.success) {
        // Update auth context
        authUpdateProfile(response.user);
        
        showToast('Profile updated successfully', 'success');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      
      const response = await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        showToast('Password updated successfully', 'success');
        
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showToast('Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showToast('Failed to update password', 'error');
    } finally {
      setUpdating(false);
    }
  };
  
  // Handle profile picture upload
  const handleImageUpload = async () => {
    if (!profileImage) {
      return;
    }
    
    try {
      setUpdating(true);
      
      const formData = new FormData();
      formData.append('profilePicture', profileImage);
      
      const response = await uploadProfilePicture(formData);
      
      if (response.success) {
        // Update auth context
        authUpdateProfile(response.user);
        
        showToast('Profile picture updated successfully', 'success');
      } else {
        showToast('Failed to update profile picture', 'error');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showToast('Failed to upload profile picture', 'error');
    } finally {
      setUpdating(false);
    }
  };
  
  // Handle search history item deletion
  const handleDeleteHistoryItem = async (historyId) => {
    try {
      const response = await deleteSearchHistoryItem(historyId);
      
      if (response.success) {
        // Update local state
        setSearchHistory(prev => prev.filter(item => item._id !== historyId));
        
        showToast('Search history item deleted', 'info');
      } else {
        showToast('Failed to delete search history item', 'error');
      }
    } catch (error) {
      console.error('Error deleting search history item:', error);
      showToast('Failed to delete search history item', 'error');
    }
  };
  
  // Handle clear all search history
  const handleClearHistory = async () => {
    try {
      const response = await clearSearchHistory();
      
      if (response.success) {
        // Update local state
        setSearchHistory([]);
        
        showToast('Search history cleared', 'info');
      } else {
        showToast('Failed to clear search history', 'error');
      }
    } catch (error) {
      console.error('Error clearing search history:', error);
      showToast('Failed to clear search history', 'error');
    }
  };
  
  // Helper function to format search query
  const formatSearchQuery = (query) => {
    if (!query) return 'Unknown search';
    
    const parts = [];
    
    if (query.propertyType) parts.push(query.propertyType);
    if (query.bedroomNum) parts.push(`${query.bedroomNum} BHK`);
    if (query.location) parts.push(`in ${query.location}`);
    else if (query.city) parts.push(`in ${query.city}`);
    
    if (query.minPrice || query.maxPrice) {
      let priceRange = 'Price: ';
      if (query.minPrice) priceRange += `₹${query.minPrice}`;
      if (query.minPrice && query.maxPrice) priceRange += ' - ';
      if (query.maxPrice) priceRange += `₹${query.maxPrice}`;
      parts.push(priceRange);
    }
    
    if (query.minArea || query.maxArea) {
      let areaRange = 'Area: ';
      if (query.minArea) areaRange += `${query.minArea} sq.ft.`;
      if (query.minArea && query.maxArea) areaRange += ' - ';
      if (query.maxArea) areaRange += `${query.maxArea} sq.ft.`;
      parts.push(areaRange);
    }
    
    return parts.join(', ') || 'General search';
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="user-info">
              <div className="profile-picture-container">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt={user?.fullName || 'User'} 
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-initials">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <h2 className="user-name">{user?.fullName}</h2>
              <p className="user-email">{user?.email}</p>
            </div>
            
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
              >
                <i className="fas fa-user"></i>
                Profile
              </button>
              <button
                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => handleTabChange('password')}
              >
                <i className="fas fa-lock"></i>
                Change Password
              </button>
              <button
                className={`tab-btn ${activeTab === 'picture' ? 'active' : ''}`}
                onClick={() => handleTabChange('picture')}
              >
                <i className="fas fa-camera"></i>
                Profile Picture
              </button>
              <button
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => handleTabChange('history')}
              >
                <i className="fas fa-history"></i>
                Search History
              </button>
            </div>
          </div>
          
          <div className="profile-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="tab-content">
                <h2 className="tab-title">Edit Profile</h2>
                
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    />
                    {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                      className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                    />
                    {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-primary update-button"
                    disabled={updating}
                  >
                    {updating ? <LoadingSpinner size="small" /> : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}
            
            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="tab-content">
                <h2 className="tab-title">Change Password</h2>
                
                <form onSubmit={handlePasswordUpdate} className="password-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    />
                    {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    />
                    {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    />
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-primary update-button"
                    disabled={updating}
                  >
                    {updating ? <LoadingSpinner size="small" /> : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
            
            {/* Profile Picture Tab */}
            {activeTab === 'picture' && (
              <div className="tab-content">
                <h2 className="tab-title">Update Profile Picture</h2>
                
                <div className="picture-container">
                  <div className="picture-preview">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile Preview" 
                        className="preview-image"
                      />
                    ) : (
                      <div className="no-image">
                        <i className="fas fa-user"></i>
                        <p>No image selected</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="picture-upload">
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                      hidden
                    />
                    <label htmlFor="profilePicture" className="file-label">
                      Choose Image
                    </label>
                    
                    {profileImage && (
                      <button
                        onClick={handleImageUpload}
                        className="btn-primary upload-button"
                        disabled={updating}
                      >
                        {updating ? <LoadingSpinner size="small" /> : 'Upload Image'}
                      </button>
                    )}
                  </div>
                  
                  <div className="picture-info">
                    <p>
                      <i className="fas fa-info-circle"></i>
                      Acceptable formats: JPG, PNG, GIF. Max size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Search History Tab */}
            {activeTab === 'history' && (
              <div className="tab-content">
                <div className="history-header">
                  <h2 className="tab-title">Search History</h2>
                  
                  {searchHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="btn-secondary clear-history-button"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {searchHistory.length > 0 ? (
                  <div className="history-list">
                    {searchHistory.map((item) => (
                      <div className="history-item" key={item._id}>
                        <div className="history-info">
                          <div className="history-query">
                            {formatSearchQuery(item.query)}
                          </div>
                          <div className="history-time">
                            {formatRelativeTime(item.timestamp)}
                          </div>
                        </div>
                        
                        <div className="history-actions">
                          <Link
                            to={`/search?${new URLSearchParams(item.query).toString()}`}
                            className="history-link"
                          >
                            <i className="fas fa-search"></i>
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteHistoryItem(item._id)}
                            className="history-delete"
                            aria-label="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-history">
                    <div className="no-history-icon">
                      <i className="fas fa-search"></i>
                    </div>
                    <p>No search history yet</p>
                    <Link to="/search" className="btn-secondary">
                      Start Searching
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;