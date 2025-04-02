import React, { useState } from 'react';
import { getPropertyImageUrl } from '../../utils/propertyUtils';
import './PropertyGallery.css';

const PropertyGallery = ({ property }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Create placeholder images if no images are available
  const placeholderImages = [
    'https://via.placeholder.com/800x600?text=No+Image+Available',
    'https://via.placeholder.com/800x600?text=Property+Photo+Unavailable',
    'https://via.placeholder.com/800x600?text=Contact+Agent+For+Photos'
  ];
  
  // Get images or use placeholders
  const images = property.images && property.images.length > 0
    ? property.images.map(image => getPropertyImageUrl({ images: [image] }))
    : placeholderImages;
  
  // Handle image change
  const handleImageChange = (index) => {
    setActiveImageIndex(index);
  };
  
  // Next image
  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Previous image
  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  return (
    <div className="property-gallery">
      <div className="gallery-main">
        <img
          src={images[activeImageIndex]}
          alt={`${property.propHeading} - Image ${activeImageIndex + 1}`}
          className="main-image"
        />
        
        <button
          className="gallery-nav prev-button"
          onClick={handlePrevImage}
          aria-label="Previous image"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <button
          className="gallery-nav next-button"
          onClick={handleNextImage}
          aria-label="Next image"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
        
        <div className="image-counter">
          {activeImageIndex + 1} / {images.length}
        </div>
      </div>
      
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((image, index) => (
            <div
              key={index}
              className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
              onClick={() => handleImageChange(index)}
            >
              <img
                src={image}
                alt={`${property.propHeading} - Thumbnail ${index + 1}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;