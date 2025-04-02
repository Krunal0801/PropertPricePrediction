// client/src/components/common/PropertySearchForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PropertySearchForm.css';

const PropertySearchForm = ({ initialValues = {} }) => {
  const [searchParams, setSearchParams] = useState({
    city: initialValues.city || '',
    location: initialValues.location || '',
    propertyType: initialValues.propertyType || '',
    bedroomNum: initialValues.bedroomNum || '',
    minPrice: initialValues.minPrice || '',
    maxPrice: initialValues.maxPrice || '',
    minArea: initialValues.minArea || '',
    maxArea: initialValues.maxArea || '',
    furnishStatus: initialValues.furnishStatus || ''
  });
  
  const navigate = useNavigate();
  
  // Cities in Mumbai
  const cities = [
    'Mumbai Andheri-Dahisar',
    'Central Mumbai suburbs',
    'Mumbai Harbour',
    'Mira Road And Beyond',
    'Mumbai Beyond Thane',
    'Mumbai South West',
    'Navi Mumbai',
    'South Mumbai',
    'Thane'
  ];
  
  // Property types
  const propertyTypes = [
    'Residential Apartment',
    'Independent House/Villa',
    'Farm House',
    'Residential Land',
    'Studio Apartment',
    'Independent/Builder Floor',
    'Serviced Apartments'
  ];
  
  // Bedroom options
  const bedroomOptions = [1, 2, 3, 4, 5, '5+'];
  
  // Furnish status options
  const furnishStatusOptions = [
    { value: '0', label: 'Unfurnished' },
    { value: '1', label: 'Furnished' },
    { value: '2', label: 'Semi-Furnished' }
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query string from search params (exclude empty values)
    const queryParams = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    // Navigate to search results page
    navigate(`/search?${queryParams.toString()}`);
  };
  
  const handleReset = () => {
    setSearchParams({
      city: '',
      location: '',
      propertyType: '',
      bedroomNum: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      furnishStatus: ''
    });
  };
  
  return (
    <div className="property-search-form-container">
      <form className="property-search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <select
            id="city"
            name="city"
            value={searchParams.city}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={searchParams.location}
            onChange={handleInputChange}
            placeholder="Enter locality"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="propertyType">Property Type</label>
          <select
            id="propertyType"
            name="propertyType"
            value={searchParams.propertyType}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">All Types</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="bedroomNum">Bedrooms</label>
          <select
            id="bedroomNum"
            name="bedroomNum"
            value={searchParams.bedroomNum}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Any</option>
            {bedroomOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="minPrice">Min Price</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={searchParams.minPrice}
              onChange={handleInputChange}
              placeholder="Min ₹"
              className="form-control"
              min="0"
            />
          </div>
          
          <div className="form-group half">
            <label htmlFor="maxPrice">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={searchParams.maxPrice}
              onChange={handleInputChange}
              placeholder="Max ₹"
              className="form-control"
              min="0"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="minArea">Min Area</label>
            <input
              type="number"
              id="minArea"
              name="minArea"
              value={searchParams.minArea}
              onChange={handleInputChange}
              placeholder="Min sq.ft."
              className="form-control"
              min="0"
            />
          </div>
          
          <div className="form-group half">
            <label htmlFor="maxArea">Max Area</label>
            <input
              type="number"
              id="maxArea"
              name="maxArea"
              value={searchParams.maxArea}
              onChange={handleInputChange}
              placeholder="Max sq.ft."
              className="form-control"
              min="0"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="furnishStatus">Furnish Status</label>
          <select
            id="furnishStatus"
            name="furnishStatus"
            value={searchParams.furnishStatus}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Any</option>
            {furnishStatusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={handleReset} className="btn-secondary">
            Reset
          </button>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertySearchForm;