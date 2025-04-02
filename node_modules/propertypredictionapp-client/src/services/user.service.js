import api from './api';

// Get user profile
export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update password
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (formData) => {
  try {
    const response = await api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// Get search history
export const getSearchHistory = async () => {
  try {
    const response = await api.get('/users/search-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching search history:', error);
    throw error;
  }
};

// Delete search history item
export const deleteSearchHistoryItem = async (historyId) => {
  try {
    const response = await api.delete(`/users/search-history/${historyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting search history item:', error);
    throw error;
  }
};

// Clear all search history
export const clearSearchHistory = async () => {
  try {
    const response = await api.delete('/users/search-history');
    return response.data;
  } catch (error) {
    console.error('Error clearing search history:', error);
    throw error;
  }
};

// Bookmark a property
export const bookmarkProperty = async (propertyId) => {
  try {
    const response = await api.post('/users/bookmarks', { propertyId });
    return response.data;
  } catch (error) {
    console.error('Error bookmarking property:', error);
    throw error;
  }
};

// Remove bookmark
export const removeBookmark = async (propertyId) => {
  try {
    const response = await api.delete(`/users/bookmarks/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};

// Get bookmarked properties
export const getBookmarkedProperties = async () => {
  try {
    const response = await api.get('/users/bookmarks');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookmarked properties:', error);
    throw error;
  }
};

// Update user preferences
export const updatePreferences = async (preferences) => {
  try {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

// Get user preferences
export const getPreferences = async () => {
  try {
    const response = await api.get('/users/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }
};