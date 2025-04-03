// client/src/utils/format.js
// Existing functions
export const formatPrice = (price) => {
  if (!price && price !== 0) return 'N/A';
  
  // Convert to number if it's a string
  const priceNum = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, '')) : price;
  
  if (isNaN(priceNum)) return 'N/A';
  
  // Format in Indian currency style
  if (priceNum >= 10000000) {
    // Convert to crores (e.g., 1.5 Cr)
    return `₹${(priceNum / 10000000).toFixed(2)} Cr`;
  } else if (priceNum >= 100000) {
    // Convert to lakhs (e.g., 25 L)
    return `₹${(priceNum / 100000).toFixed(2)} L`;
  } else {
    // Regular formatting for smaller amounts
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(priceNum);
  }
};

export const formatArea = (area) => {
  if (!area && area !== 0) return 'N/A';
  
  // Convert to number if it's a string
  const areaNum = typeof area === 'string' ? parseFloat(area.replace(/[^0-9.-]+/g, '')) : area;
  
  if (isNaN(areaNum)) return 'N/A';
  
  return `${areaNum.toLocaleString('en-IN')} sq.ft.`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return 'N/A';
  
  const now = new Date();
  const diffInMs = now - date;
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  
  if (diffInSecs < 60) {
    return 'Just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  }
};

// Add the missing functions

// Get property type display name
export const getPropertyTypeDisplay = (propertyType) => {
  const typeMap = {
    'Residential Apartment': 'Apartment',
    'Independent House/Villa': 'Villa',
    'Farm House': 'Farm House',
    'Residential Land': 'Land',
    'Studio Apartment': 'Studio',
    'Independent/Builder Floor': 'Builder Floor',
    'Serviced Apartments': 'Serviced Apartment'
  };
  
  return typeMap[propertyType] || propertyType;
};

// Get furnish status display name
export const getFurnishStatusDisplay = (furnishStatus) => {
  const statusMap = {
    0: 'Unfurnished',
    1: 'Furnished',
    2: 'Semi-Furnished'
  };
  
  return statusMap[furnishStatus] || 'Unknown';
};

// Get facing direction display name
export const getFacingDirectionDisplay = (facingCode) => {
  const facingMap = {
    1: 'North',
    2: 'South',
    3: 'East',
    4: 'West',
    5: 'North-East',
    6: 'North-West',
    7: 'South-East',
    8: 'South-West'
  };
  
  return facingMap[facingCode] || 'Unknown';
};

// Get property image URL or placeholder if not available
export const getPropertyImageUrl = (property) => {
  if (property.images && property.images.length > 0) {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${property.images[0]}`;
  }
  
  return 'https://via.placeholder.com/300x200?text=No+Image+Available';
  //return 'C:/NMIMS/SemII/AWT/Project/propertypredictionapp/server/uploads/property-images/5d7166928dbdb0813a03d4ab78960d21-cc_ft_960.jpg';
};