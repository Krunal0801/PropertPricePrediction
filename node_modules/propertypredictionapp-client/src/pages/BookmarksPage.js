import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookmarkedProperties, removeBookmark } from '../services/user.service';
import { useNotification } from '../context/NotificationContext';
import PropertyCard from '../components/common/PropertyCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './BookmarksPage.css';

const BookmarksPage = () => {
  const [bookmarkedProperties, setBookmarkedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState([]);
  
  const { showToast } = useNotification();
  
  // Fetch bookmarked properties
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        
        const response = await getBookmarkedProperties();
        
        if (response.success) {
          setBookmarkedProperties(response.bookmarkedProperties);
          setBookmarked(response.bookmarkedProperties.map(property => property._id));
        } else {
          showToast('Failed to fetch bookmarked properties', 'error');
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        showToast('Failed to fetch bookmarked properties', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [showToast]);
  
  // Handle bookmark toggle
  const handleToggleBookmark = async (propertyId) => {
    try {
      await removeBookmark(propertyId);
      
      // Remove property from state
      setBookmarkedProperties(prev => 
        prev.filter(property => property._id !== propertyId)
      );
      
      setBookmarked(prev => 
        prev.filter(id => id !== propertyId)
      );
      
      showToast('Property removed from bookmarks', 'info');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      showToast('Failed to remove bookmark', 'error');
    }
  };
  
  return (
    <div className="bookmarks-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Bookmarked Properties</h1>
          <p className="page-subtitle">
            View and manage your saved properties
          </p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {bookmarkedProperties.length > 0 ? (
              <div className="properties-grid">
                {bookmarkedProperties.map(property => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    isBookmarked={bookmarked.includes(property._id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="no-bookmarks">
                <div className="no-bookmarks-icon">
                  <i className="fas fa-bookmark"></i>
                </div>
                <h2>No Bookmarked Properties</h2>
                <p>
                  You haven't saved any properties yet. Browse properties and click the 
                  bookmark icon to save them for later.
                </p>
                <Link to="/search" className="btn-primary">
                  Browse Properties
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;