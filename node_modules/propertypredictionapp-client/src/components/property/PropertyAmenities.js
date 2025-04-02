import React from 'react';
import './PropertyAmenities.css';

const PropertyAmenities = ({ amenities, features }) => {
  // Helper function to parse amenities and features strings
  const parseItems = (itemsString) => {
    if (!itemsString) return [];
    
    try {
      // Try to parse as JSON array first
      if (itemsString.startsWith('[')) {
        return JSON.parse(itemsString);
      }
      
      // If not JSON, split by comma
      return itemsString.split(',').map(item => item.trim());
    } catch (error) {
      // If parsing fails, just split by comma
      return itemsString.split(',').map(item => item.trim());
    }
  };
  
  // Common amenities to display with appropriate icons
  const amenitiesMap = {
    '1': { name: 'Power Backup', icon: 'fas fa-bolt' },
    '12': { name: 'Air Conditioning', icon: 'fas fa-snowflake' },
    '17': { name: 'Swimming Pool', icon: 'fas fa-swimming-pool' },
    '19': { name: 'Garden', icon: 'fas fa-leaf' },
    '21': { name: 'Parking', icon: 'fas fa-parking' },
    '23': { name: 'Security', icon: 'fas fa-shield-alt' },
    '24': { name: 'Lift', icon: 'fas fa-arrow-up' },
    '25': { name: 'Gym', icon: 'fas fa-dumbbell' },
    '26': { name: 'Club House', icon: 'fas fa-glass-cheers' },
    '29': { name: 'Children\'s Play Area', icon: 'fas fa-child' },
    '32': { name: 'Gated Community', icon: 'fas fa-door-closed' },
    '40': { name: 'Water Supply', icon: 'fas fa-tint' },
    '41': { name: 'Sewage', icon: 'fas fa-water' },
    '42': { name: 'Rain Water Harvesting', icon: 'fas fa-cloud-rain' },
    '44': { name: 'Park', icon: 'fas fa-tree' },
    '45': { name: 'Internet/Wi-Fi', icon: 'fas fa-wifi' },
    '46': { name: 'Intercom', icon: 'fas fa-phone' },
    '47': { name: 'Fire Safety', icon: 'fas fa-fire-extinguisher' },
    '101': { name: 'Visitor Parking', icon: 'fas fa-car' },
    '102': { name: 'Waste Disposal', icon: 'fas fa-trash' },
    '103': { name: 'ATM', icon: 'fas fa-money-check-alt' },
    '105': { name: 'Shopping Center', icon: 'fas fa-shopping-bag' },
    '106': { name: 'Hospital', icon: 'fas fa-hospital' }
  };
  
  // Features to display with appropriate icons
  const featuresMap = {
    '1': { name: 'Corner Property', icon: 'fas fa-border-all' },
    '6': { name: 'Main Road Facing', icon: 'fas fa-road' },
    '8': { name: 'Near Metro', icon: 'fas fa-subway' },
    '9': { name: 'Near Bus Stop', icon: 'fas fa-bus' },
    '17': { name: 'Newly Built', icon: 'fas fa-home' },
    '19': { name: 'Garden Facing', icon: 'fas fa-leaf' },
    '20': { name: 'Park Facing', icon: 'fas fa-tree' },
    '28': { name: 'Freehold', icon: 'fas fa-check-circle' },
    '30': { name: 'Under Construction', icon: 'fas fa-hard-hat' }
  };
  
  // Parse the amenities and features
  const parsedAmenities = parseItems(amenities);
  const parsedFeatures = parseItems(features);
  
  // Get available amenities
  const availableAmenities = Object.keys(amenitiesMap).filter(id => 
    parsedAmenities.includes(id)
  ).map(id => amenitiesMap[id]);
  
  // Get available features
  const availableFeatures = Object.keys(featuresMap).filter(id => 
    parsedFeatures.includes(id)
  ).map(id => featuresMap[id]);
  
  return (
    <div className="property-amenities">
      {availableAmenities.length > 0 && (
        <div className="amenities-section">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {availableAmenities.map((amenity, index) => (
              <div className="amenity-item" key={index}>
                <div className="amenity-icon">
                  <i className={amenity.icon}></i>
                </div>
                <div className="amenity-name">{amenity.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {availableFeatures.length > 0 && (
        <div className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            {availableFeatures.map((feature, index) => (
              <div className="feature-item" key={index}>
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <div className="feature-name">{feature.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyAmenities;