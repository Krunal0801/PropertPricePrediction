import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  formatPrice, 
  formatArea, 
  getPropertyImageUrl,
  getPropertyTypeDisplay 
} from '../../utils/format';
import { bookmarkProperty, removeBookmark } from '../../services/user.service';
import './PropertyCard.css';

const PropertyCard = ({ property, isBookmarked = false, onToggleBookmark }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  
  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast('Please login to bookmark properties', 'warning');
      return;
    }
    
    try {
      if (isBookmarked) {
        await removeBookmark(property._id);
        showToast('Property removed from bookmarks', 'info');
      } else {
        await bookmarkProperty(property._id);
        showToast('Property added to bookmarks', 'success');
      }
      
      if (onToggleBookmark) {
        onToggleBookmark(property._id);
      }
    } catch (error) {
      showToast('Failed to update bookmark', 'error');
      console.error('Bookmark error:', error);
    }
  };
  
  return (
    <div className="property-card">
      <Link to={`/property/${property._id}`} className="property-link">
        <div className="property-image-container">
          <img 
            src={getPropertyImageUrl(property)} 
            alt={property.propHeading} 
            className="property-image"
          />
          <div className="property-type-badge">
            {getPropertyTypeDisplay(property.propertyType)}
          </div>
          {property.isPremium && (
            <div className="premium-badge">
              Premium
            </div>
          )}
          <button 
            className={`bookmark-button ${isBookmarked ? 'active' : ''}`}
            onClick={handleToggleBookmark}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <i className={`${isBookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
          </button>
        </div>
        
        <div className="property-content">
          <div className="property-price">{formatPrice(property.price)}</div>
          <h3 className="property-title">{property.propHeading}</h3>
          
          <div className="property-details">
            <div className="property-detail">
              <i className="fas fa-map-marker-alt"></i>
              <span>{property.location?.localityName || 'Unknown Location'}, {property.city}</span>
            </div>
            
            {property.bedroomNum && (
              <div className="property-detail">
                <i className="fas fa-bed"></i>
                <span>{property.bedroomNum} {property.bedroomNum === 1 ? 'Bed' : 'Beds'}</span>
              </div>
            )}
            
            <div className="property-detail">
              <i className="fas fa-expand"></i>
              <span>{formatArea(property.minAreaSqft)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;