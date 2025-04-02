import React, { useEffect, useState } from 'react';
import './PropertyMap.css';

const PropertyMap = ({ latitude, longitude, address }) => {
  const [mapUrl, setMapUrl] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Validate latitude and longitude
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Location coordinates are invalid');
      return;
    }
    
    // Generate Google Maps embed URL
    const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    setMapUrl(mapEmbedUrl);
  }, [latitude, longitude]);
  
  // Generate direct link to Google Maps
  const getDirectionsUrl = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return '#';
    }
    
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };
  
  return (
    <div className="property-map">
      {error ? (
        <div className="map-error">
          <p>{error}</p>
        </div>
      ) : mapUrl ? (
        <>
          <div className="map-container">
            <iframe
              src={mapUrl}
              width="100%"
              height="450"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen=""
              aria-hidden="false"
              tabIndex="0"
              title="Property Location Map"
            ></iframe>
          </div>
          
          <div className="map-actions">
            <a 
              href={getDirectionsUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="directions-link"
            >
              <i className="fas fa-directions"></i> Get Directions
            </a>
            
            <div className="property-address">
              <i className="fas fa-map-marker-alt"></i> {address}
            </div>
          </div>
        </>
      ) : (
        <div className="map-loading">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
