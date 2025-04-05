// client/src/pages/PredictionPage.js
import React, { useState, useEffect } from 'react';
import { getPricePrediction, getPriceTrends } from '../services/prediction.service';
import { getProperties } from '../services/property.service';
import { getNearbyPOIs } from '../services/location.service'; // You'll need to create this service
import { useNotification } from '../context/NotificationContext';
import { formatPrice } from '../utils/format';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PredictionPage.css';

const PredictionPage = () => {
  const [formData, setFormData] = useState({
    propertyType: '',
    city: '',
    locality: '',
    bedroomNum: '',
    furnishStatus: '',
    area: '',
    years: 5,
    age: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [localities, setLocalities] = useState([]);
  const [localityCoordinates, setLocalityCoordinates] = useState({});
  const [trends, setTrends] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [nearbyPOIs, setNearbyPOIs] = useState([]);
  const [poiLoading, setPOILoading] = useState(false);
  
  const { showToast } = useNotification();
  
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
  
  // Bedroom options
  const bedroomOptions = [1, 2, 3, 4, 5];
  
  // Furnish status options
  const furnishStatusOptions = [
    { value: '0', label: 'Unfurnished' },
    { value: '1', label: 'Furnished' },
    { value: '2', label: 'Semi-Furnished' }
  ];
  
  // Property age options
  const ageOptions = [0, 1, 2, 3, 5, 7, 10, 15, 20];
  
  // Years options
  const yearsOptions = [5, 10, 15, 20];
  
  // POI categories with icons
  const poiCategories = {
    'transit_station': { label: 'Transit Stations', icon: 'fas fa-train' },
    'metro_station': { label: 'Metro Stations', icon: 'fas fa-subway' },
    'railway_station': { label: 'Railway Stations', icon: 'fas fa-train' },
    'school': { label: 'Schools', icon: 'fas fa-school' },
    'college': { label: 'Colleges', icon: 'fas fa-graduation-cap' },
    'shopping_mall': { label: 'Shopping Malls', icon: 'fas fa-shopping-bag' },
    'supermarket': { label: 'Supermarkets', icon: 'fas fa-shopping-cart' },
    'hospital': { label: 'Hospitals', icon: 'fas fa-hospital' },
    'park': { label: 'Parks', icon: 'fas fa-tree' },
    'restaurant': { label: 'Restaurants', icon: 'fas fa-utensils' }
  };
  
  // Fetch localities when city changes
  useEffect(() => {
    const fetchLocalities = async () => {
      if (!formData.city) {
        setLocalities([]);
        return;
      }
      
      try {
        const response = await getProperties({
          city: formData.city,
          limit: 100
        });
        
        if (response.success) {
          // Extract unique localities and their coordinates
          const localityMap = {};
          const uniqueLocalities = [];
          
          response.properties.forEach(property => {
            const localityName = property.location?.localityName;
            
            if (localityName && !localityMap[localityName]) {
              uniqueLocalities.push(localityName);
              
              // Store coordinates for each locality if available
              if (property.mapDetails?.latitude && property.mapDetails?.longitude) {
                localityMap[localityName] = {
                  lat: property.mapDetails.latitude,
                  lng: property.mapDetails.longitude
                };
              }
            }
          });
          
          setLocalities(uniqueLocalities.sort());
          setLocalityCoordinates(localityMap);
        }
      } catch (error) {
        console.error('Error fetching localities:', error);
      }
    };
    
    fetchLocalities();
  }, [formData.city]);
  
  // Fetch nearby points of interest when locality changes
  useEffect(() => {
    const fetchNearbyPOIs = async () => {
      if (!formData.locality || !localityCoordinates[formData.locality]) {
        setNearbyPOIs([]);
        return;
      }
      
      try {
        setPOILoading(true);
        const coords = localityCoordinates[formData.locality];
        
        // Call the service to get nearby POIs
        const poiTypes = ['transit_station', 'school', 'shopping_mall', 'hospital', 'supermarket'];
        const response = await getNearbyPOIs(coords.lat, coords.lng, 2, poiTypes);
        
        if (response.success) {
          setNearbyPOIs(response.pois);
        }
      } catch (error) {
        console.error('Error fetching nearby points of interest:', error);
      } finally {
        setPOILoading(false);
      }
    };
    
    fetchNearbyPOIs();
  }, [formData.locality, localityCoordinates]);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset prediction when form changes
    setPrediction(null);
  };
  
  // Validate form
  const validateForm = () => {
    if (!formData.propertyType) {
      showToast('Please select a property type', 'warning');
      return false;
    }
    
    if (!formData.city) {
      showToast('Please select a city', 'warning');
      return false;
    }
    
    if (!formData.locality) {
      showToast('Please select a locality', 'warning');
      return false;
    }
    
    if (!formData.area) {
      showToast('Please enter the property area', 'warning');
      return false;
    }
    
    if (isNaN(formData.area) || parseFloat(formData.area) <= 0) {
      showToast('Please enter a valid property area', 'warning');
      return false;
    }
    
    return true;
  };
  
  // Group POIs by category
  const groupedPOIs = nearbyPOIs.reduce((groups, poi) => {
    const category = poi.types[0] || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(poi);
    return groups;
  }, {});
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setPrediction(null);
    
    try {
      // Create request payload with location data
      const requestData = {
        propertyType: formData.propertyType,
        city: formData.city,
        locality: formData.locality,
        bedroomNum: formData.bedroomNum ? parseInt(formData.bedroomNum) : null,
        furnishStatus: formData.furnishStatus ? parseInt(formData.furnishStatus) : 0,
        area: parseFloat(formData.area),
        years: parseInt(formData.years),
        age: parseInt(formData.age) || 0
      };
      
      // Add location data if available for the selected locality
      const coords = localityCoordinates[formData.locality];
      if (coords) {
        requestData.latitude = coords.lat;
        requestData.longitude = coords.lng;
      }
      
      const response = await getPricePrediction(requestData);
      
      if (response.success) {
        setPrediction(response.predictions);
        
        // Fetch price trends for the selected city and property type
        fetchTrends();
      } else {
        showToast('Failed to get price prediction', 'error');
      }
    } catch (error) {
      console.error('Error getting prediction:', error);
      showToast('Failed to get price prediction', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch price trends
  const fetchTrends = async () => {
    setTrendLoading(true);
    
    try {
      const response = await getPriceTrends(
        formData.city,
        formData.propertyType,
        parseInt(formData.years)
      );
      
      if (response.success) {
        setTrends(response.trends);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setTrendLoading(false);
    }
  };
  
  // Function to get POI display name
  const getPOIDisplayName = (poiType) => {
    return poiCategories[poiType]?.label || poiType.replace('_', ' ');
  };
  
  // Function to get POI icon
  const getPOIIcon = (poiType) => {
    return poiCategories[poiType]?.icon || 'fas fa-map-marker-alt';
  };
  
  return (
    <div className="prediction-page">
      <div className="container">
        <div className="prediction-header">
          <h1 className="prediction-title">AI-Powered Price Prediction</h1>
          <p className="prediction-subtitle">
            Get accurate property price predictions for the next 5-20 years
            based on location, property type, and nearby amenities within a 2km radius.
          </p>
        </div>
        
        <div className="prediction-content">
          <div className="prediction-form-container">
            <h2>Property Details</h2>
            <form className="prediction-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="propertyType">Property Type</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Property Type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="locality">Locality</label>
                <select
                  id="locality"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  className="form-control"
                  disabled={!formData.city || localities.length === 0}
                >
                  <option value="">Select Locality</option>
                  {localities.map(locality => (
                    <option key={locality} value={locality}>{locality}</option>
                  ))}
                </select>
                
                {formData.locality && localityCoordinates[formData.locality] && (
                  <div className="location-info">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Location data available</span>
                  </div>
                )}
                
                {formData.locality && nearbyPOIs.length > 0 && (
                  <div className="hotspot-badge">
                    <i className="fas fa-map-pin"></i>
                    <span>{nearbyPOIs.length} points of interest found within 2km</span>
                  </div>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="bedroomNum">Bedrooms</label>
                  <select
                    id="bedroomNum"
                    name="bedroomNum"
                    value={formData.bedroomNum}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Bedrooms</option>
                    {bedroomOptions.map(option => (
                      <option key={option} value={option}>{option} BHK</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="furnishStatus">Furnishing</label>
                  <select
                    id="furnishStatus"
                    name="furnishStatus"
                    value={formData.furnishStatus}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Furnishing</option>
                    {furnishStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="area">Area (sq.ft.)</label>
                  <input
                    type="number"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter area in sq.ft."
                    min="1"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="age">Property Age (years)</label>
                  <select
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Age</option>
                    {ageOptions.map(age => (
                      <option key={age} value={age}>{age} Years</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="years">Prediction Years</label>
                <select
                  id="years"
                  name="years"
                  value={formData.years}
                  onChange={handleChange}
                  className="form-control"
                >
                  {yearsOptions.map(years => (
                    <option key={years} value={years}>{years} Years</option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="btn-primary predict-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>Get Price Prediction</>
                )}
              </button>
            </form>
          </div>
          
          <div className="prediction-results">
            {isLoading ? (
              <div className="loading-container">
                <LoadingSpinner size="large" />
                <p>Analyzing property data and nearby amenities...</p>
              </div>
            ) : prediction ? (
              <div className="prediction-data">
                <h2>Price Prediction Results</h2>
                
                <div className="current-prediction">
                  <div className="prediction-box">
                    <h3>Current Estimated Price</h3>
                    <div className="prediction-price">
                      {formatPrice(prediction.currentPricePrediction)}
                    </div>
                    <div className="price-per-sqft">
                      {formatPrice(prediction.currentPricePerSqft)} per sq.ft.
                    </div>
                    
                    {/* Show location badge if location was used */}
                    {prediction.locationFactor && (
                      <div className="location-badge">
                        <i className="fas fa-map-marker-alt"></i>
                        Location-based
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="future-heading">Future Price Predictions</h3>
                <div className="future-predictions">
                  {prediction.futurePredictions.map((item, index) => (
                    <div className="prediction-box future-box" key={index}>
                      <div className="prediction-year">{item.year}</div>
                      <div className="prediction-price">
                        {formatPrice(item.predictedPrice)}
                      </div>
                      <div className="price-per-sqft">
                        {formatPrice(item.predictedPricePerSqft)} per sq.ft.
                      </div>
                      <div className="growth-rate">
                        Growth Rate: <span>{item.growthRate}%</span> per year
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Display nearby property info if available */}
                {prediction.nearbyPropertyCount > 0 && (
                  <div className="nearby-info">
                    <h3>Nearby Property Analysis</h3>
                    <div className="nearby-stats">
                      <div className="stat-item">
                        <div className="stat-label">Properties Analyzed</div>
                        <div className="stat-value">{prediction.nearbyPropertyCount}</div>
                      </div>
                      
                      {prediction.avgNearbyPrice && (
                        <div className="stat-item">
                          <div className="stat-label">Avg. Price per sq.ft.</div>
                          <div className="stat-value">{formatPrice(prediction.avgNearbyPrice)}</div>
                        </div>
                      )}
                      
                      <div className="stat-item">
                        <div className="stat-label">Annual Growth Rate</div>
                        <div className="stat-value">{prediction.annualGrowthRate}%</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Display points of interest if available */}
                {Object.keys(groupedPOIs).length > 0 && (
                  <div className="poi-section">
                    <h3>Points of Interest (2km Radius)</h3>
                    <p className="poi-description">
                      These amenities and landmarks within 2km of your selected locality 
                      influence property value and growth potential.
                    </p>
                    
                    <div className="poi-categories">
                      {Object.entries(groupedPOIs).map(([category, pois]) => (
                        <div className="poi-category" key={category}>
                          <div className="category-header">
                            <i className={getPOIIcon(category)}></i>
                            <h4>{getPOIDisplayName(category)} ({pois.length})</h4>
                          </div>
                          <ul className="poi-list">
                            {pois.slice(0, 5).map((poi, index) => (
                              <li key={index} className="poi-item">
                                <span className="poi-name">{poi.name}</span>
                                {poi.distance && (
                                  <span className="poi-distance">{poi.distance.toFixed(1)} km</span>
                                )}
                              </li>
                            ))}
                            {pois.length > 5 && (
                              <li className="poi-more">
                                +{pois.length - 5} more {getPOIDisplayName(category).toLowerCase()}
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Price Trends */}
                {trendLoading ? (
                  <div className="loading-container">
                    <LoadingSpinner size="medium" />
                    <p>Loading market trends...</p>
                  </div>
                ) : trends ? (
                  <div className="price-trends">
                    <h3>Market Insights</h3>
                    
                    <div className="market-overview">
                      <div className="overview-stat">
                        <div className="stat-label">Avg. Price/sq.ft. in {formData.city}</div>
                        <div className="stat-value">
                          {formatPrice(trends.overallStats.avgPricePerSqft)}
                        </div>
                      </div>
                      
                      <div className="overview-stat">
                        <div className="stat-label">Historical Growth</div>
                        <div className="stat-value">
                          {trends.overallStats.annualGrowthRate}% per year
                        </div>
                      </div>
                      
                      <div className="overview-stat">
                        <div className="stat-label">Properties Analyzed</div>
                        <div className="stat-value">
                          {trends.overallStats.totalProperties.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {trends.bedroomPrices && trends.bedroomPrices.length > 0 && (
                      <div className="bedroom-prices">
                        <h4>Price by Bedroom Type</h4>
                        <div className="bedroom-chart">
                          {trends.bedroomPrices.map((item, index) => (
                            <div className="bedroom-bar" key={index}>
                              <div className="bedroom-label">{item.bedroomNum} BHK</div>
                              <div className="bedroom-value">
                                {formatPrice(item.avgPricePerSqft)} per sq.ft.
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                
                <div className="prediction-disclaimer">
                  <h4>Disclaimer</h4>
                  <p>
                    These predictions are based on historical data, market trends, and nearby points of 
                    interest within a 2km radius. Actual prices may vary depending on various factors 
                    including market conditions, property specifications, and economic changes.
                    Always consult with a real estate professional before making investment decisions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="no-prediction">
                <div className="prediction-placeholder">
                  <i className="fas fa-chart-line"></i>
                  <h3>AI Price Prediction Tool</h3>
                  <p>
                    Fill in the property details form to get price predictions for 
                    the next {formData.years} years. Our algorithm analyzes nearby points
                    of interest such as metro stations, malls, and schools within a 2km radius.
                  </p>
                  <div className="prediction-features">
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Location-based analysis</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Nearby amenities impact</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Future price projections</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Historical trend analysis</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Market comparison data</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Transit connectivity score</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;





























// // client/src/pages/PredictionPage.js
// import React, { useState, useEffect } from 'react';
// import { getPricePrediction, getPriceTrends } from '../services/prediction.service';
// import { getProperties } from '../services/property.service';
// import { useNotification } from '../context/NotificationContext';
// import { formatPrice } from '../utils/format';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import './PredictionPage.css';

// const PredictionPage = () => {
//   const [formData, setFormData] = useState({
//     propertyType: '',
//     city: '',
//     locality: '',
//     bedroomNum: '',
//     furnishStatus: '',
//     area: '',
//     years: 5
//   });
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [prediction, setPrediction] = useState(null);
//   const [localities, setLocalities] = useState([]);
//   const [trends, setTrends] = useState(null);
//   const [trendLoading, setTrendLoading] = useState(false);
  
//   const { showToast } = useNotification();
  
//   // Property types
//   const propertyTypes = [
//     'Residential Apartment',
//     'Independent House/Villa',
//     'Farm House',
//     'Residential Land',
//     'Studio Apartment',
//     'Independent/Builder Floor',
//     'Serviced Apartments'
//   ];
  
//   // Cities in Mumbai
//   const cities = [
//     'Mumbai Andheri-Dahisar',
//     'Central Mumbai suburbs',
//     'Mumbai Harbour',
//     'Mira Road And Beyond',
//     'Mumbai Beyond Thane',
//     'Mumbai South West',
//     'Navi Mumbai',
//     'South Mumbai',
//     'Thane'
//   ];
  
//   // Bedroom options
//   const bedroomOptions = [1, 2, 3, 4, 5];
  
//   // Furnish status options
//   const furnishStatusOptions = [
//     { value: '0', label: 'Unfurnished' },
//     { value: '1', label: 'Furnished' },
//     { value: '2', label: 'Semi-Furnished' }
//   ];
  
//   // Years options
//   const yearsOptions = [5, 10, 15, 20];
  
//   // Fetch localities when city changes
//   useEffect(() => {
//     const fetchLocalities = async () => {
//       if (!formData.city) {
//         setLocalities([]);
//         return;
//       }
      
//       try {
//         const response = await getProperties({
//           city: formData.city,
//           limit: 100
//         });
        
//         if (response.success) {
//           // Extract unique localities
//           const uniqueLocalities = [...new Set(
//             response.properties
//               .map(property => property.location?.localityName)
//               .filter(Boolean)
//           )];
          
//           setLocalities(uniqueLocalities.sort());
//         }
//       } catch (error) {
//         console.error('Error fetching localities:', error);
//       }
//     };
    
//     fetchLocalities();
//   }, [formData.city]);
  
//   // Handle form input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
    
//     // Reset prediction when form changes
//     setPrediction(null);
//   };
  
//   // Validate form
//   const validateForm = () => {
//     if (!formData.propertyType) {
//       showToast('Please select a property type', 'warning');
//       return false;
//     }
    
//     if (!formData.city) {
//       showToast('Please select a city', 'warning');
//       return false;
//     }
    
//     // if (!formData.locality) {
//     //   showToast('Please select a locality', 'warning');
//     //   return false;
//     // }
    
//     if (!formData.area) {
//       showToast('Please enter the property area', 'warning');
//       return false;
//     }
    
//     if (isNaN(formData.area) || parseFloat(formData.area) <= 0) {
//       showToast('Please enter a valid property area', 'warning');
//       return false;
//     }
    
//     return true;
//   };
  
//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
    
//     setIsLoading(true);
//     setPrediction(null);
    
//     try {
//       const response = await getPricePrediction({
//         propertyType: formData.propertyType,
//         city: formData.city,
//         locality: formData.locality,
//         bedroomNum: formData.bedroomNum ? parseInt(formData.bedroomNum) : null,
//         furnishStatus: formData.furnishStatus ? parseInt(formData.furnishStatus) : 0,
//         area: parseFloat(formData.area),
//         years: parseInt(formData.years)
//       });
      
//       if (response.success) {
//         setPrediction(response.predictions);
        
//         // Fetch price trends for the selected city and property type
//         fetchTrends();
//       } else {
//         showToast('Failed to get price prediction', 'error');
//       }
//     } catch (error) {
//       console.error('Error getting prediction:', error);
//       showToast('Failed to get price prediction', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Fetch price trends
//   const fetchTrends = async () => {
//     setTrendLoading(true);
    
//     try {
//       const response = await getPriceTrends(
//         formData.city,
//         formData.propertyType,
//         parseInt(formData.years)
//       );
      
//       if (response.success) {
//         setTrends(response.trends);
//       }
//     } catch (error) {
//       console.error('Error fetching trends:', error);
//     } finally {
//       setTrendLoading(false);
//     }
//   };
  
//   return (
//     <div className="prediction-page">
//       <div className="container">
//         <div className="prediction-header">
//           <h1 className="prediction-title">AI-Powered Price Prediction</h1>
//           <p className="prediction-subtitle">
//             Get accurate property price predictions for the next 5-20 years
//             based on location, property type, and other factors.
//           </p>
//         </div>
        
//         <div className="prediction-content">
//           <div className="prediction-form-container">
//             <h2>Property Details</h2>
//             <form className="prediction-form" onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label htmlFor="propertyType">Property Type</label>
//                 <select
//                   id="propertyType"
//                   name="propertyType"
//                   value={formData.propertyType}
//                   onChange={handleChange}
//                   className="form-control"
//                 >
//                   <option value="">Select Property Type</option>
//                   {propertyTypes.map(type => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="form-group">
//                 <label htmlFor="city">City</label>
//                 <select
//                   id="city"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleChange}
//                   className="form-control"
//                 >
//                   <option value="">Select City</option>
//                   {cities.map(city => (
//                     <option key={city} value={city}>{city}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="form-group">
//                 <label htmlFor="locality">Locality</label>
//                 <select
//                   id="locality"
//                   name="locality"
//                   value={formData.locality}
//                   onChange={handleChange}
//                   className="form-control"
//                   disabled={!formData.city || localities.length === 0}
//                 >
//                   <option value="">Select Locality</option>
//                   {localities.map(locality => (
//                     <option key={locality} value={locality}>{locality}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label htmlFor="bedroomNum">Bedrooms</label>
//                   <select
//                     id="bedroomNum"
//                     name="bedroomNum"
//                     value={formData.bedroomNum}
//                     onChange={handleChange}
//                     className="form-control"
//                   >
//                     <option value="">Select Bedrooms</option>
//                     {bedroomOptions.map(option => (
//                       <option key={option} value={option}>{option} BHK</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div className="form-group half">
//                   <label htmlFor="furnishStatus">Furnishing</label>
//                   <select
//                     id="furnishStatus"
//                     name="furnishStatus"
//                     value={formData.furnishStatus}
//                     onChange={handleChange}
//                     className="form-control"
//                   >
//                     <option value="">Select Furnishing</option>
//                     {furnishStatusOptions.map(option => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
              
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label htmlFor="area">Area (sq.ft.)</label>
//                   <input
//                     type="number"
//                     id="area"
//                     name="area"
//                     value={formData.area}
//                     onChange={handleChange}
//                     className="form-control"
//                     placeholder="Enter area in sq.ft."
//                     min="1"
//                   />
//                 </div>
                
//                 <div className="form-group half">
//                   <label htmlFor="years">Prediction Years</label>
//                   <select
//                     id="years"
//                     name="years"
//                     value={formData.years}
//                     onChange={handleChange}
//                     className="form-control"
//                   >
//                     {yearsOptions.map(years => (
//                       <option key={years} value={years}>{years} Years</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
              
//               <button
//                 type="submit"
//                 className="btn-primary predict-button"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <LoadingSpinner size="small" />
//                 ) : (
//                   <>Get Price Prediction</>
//                 )}
//               </button>
//             </form>
//           </div>
          
//           <div className="prediction-results">
//             {isLoading ? (
//               <div className="loading-container">
//                 <LoadingSpinner size="large" />
//                 <p>Analyzing property data...</p>
//               </div>
//             ) : prediction ? (
//               <div className="prediction-data">
//                 <h2>Price Prediction Results</h2>
                
//                 <div className="current-prediction">
//                   <div className="prediction-box">
//                     <h3>Current Estimated Price</h3>
//                     <div className="prediction-price">
//                       {formatPrice(prediction.currentPricePrediction)}
//                     </div>
//                     <div className="price-per-sqft">
//                       {formatPrice(prediction.currentPricePerSqft)} per sq.ft.
//                     </div>
//                   </div>
//                 </div>
                
//                 <h3 className="future-heading">Future Price Predictions</h3>
//                 <div className="future-predictions">
//                   {prediction.futurePredictions.map((item, index) => (
//                     <div className="prediction-box future-box" key={index}>
//                       <div className="prediction-year">{item.year}</div>
//                       <div className="prediction-price">
//                         {formatPrice(item.predictedPrice)}
//                       </div>
//                       <div className="price-per-sqft">
//                         {formatPrice(item.predictedPricePerSqft)} per sq.ft.
//                       </div>
//                       <div className="growth-rate">
//                         Growth Rate: <span>{item.growthRate}%</span> per year
//                       </div>
//                     </div>
//                   ))}
//                 </div>
                
//                 {/* Price Trends */}
//                 {trendLoading ? (
//                   <div className="loading-container">
//                     <LoadingSpinner size="medium" />
//                     <p>Loading market trends...</p>
//                   </div>
//                 ) : trends ? (
//                   <div className="price-trends">
//                     <h3>Market Insights</h3>
                    
//                     <div className="market-overview">
//                       <div className="overview-stat">
//                         <div className="stat-label">Avg. Price/sq.ft. in {formData.city}</div>
//                         <div className="stat-value">
//                           {formatPrice(trends.overallStats.avgPricePerSqft)}
//                         </div>
//                       </div>
                      
//                       <div className="overview-stat">
//                         <div className="stat-label">Historical Growth</div>
//                         <div className="stat-value">
//                           {trends.overallStats.annualGrowthRate}% per year
//                         </div>
//                       </div>
                      
//                       <div className="overview-stat">
//                         <div className="stat-label">Properties Analyzed</div>
//                         <div className="stat-value">
//                           {trends.overallStats.totalProperties.toLocaleString()}
//                         </div>
//                       </div>
//                     </div>
                    
//                     {trends.bedroomPrices && trends.bedroomPrices.length > 0 && (
//                       <div className="bedroom-prices">
//                         <h4>Price by Bedroom Type</h4>
//                         <div className="bedroom-chart">
//                           {trends.bedroomPrices.map((item, index) => (
//                             <div className="bedroom-bar" key={index}>
//                               <div className="bedroom-label">{item.bedroomNum} BHK</div>
//                               <div className="bedroom-value">
//                                 {formatPrice(item.avgPricePerSqft)} per sq.ft.
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ) : null}
                
//                 <div className="prediction-disclaimer">
//                   <h4>Disclaimer</h4>
//                   <p>
//                     These predictions are based on historical data and market trends. 
//                     Actual prices may vary depending on various factors including
//                     market conditions, property specifications, and economic changes.
//                     Always consult with a real estate professional before making investment decisions.
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <div className="no-prediction">
//                 <div className="prediction-placeholder">
//                   <i className="fas fa-chart-line"></i>
//                   <h3>AI Price Prediction Tool</h3>
//                   <p>
//                     Fill in the property details form to get price predictions for 
//                     the next {formData.years} years.
//                   </p>
//                   <div className="prediction-features">
//                     <div className="feature">
//                       <i className="fas fa-check-circle"></i>
//                       <span>Location-based analysis</span>
//                     </div>
//                     <div className="feature">
//                       <i className="fas fa-check-circle"></i>
//                       <span>Property type comparison</span>
//                     </div>
//                     <div className="feature">
//                       <i className="fas fa-check-circle"></i>
//                       <span>Future price projections</span>
//                     </div>
//                     <div className="feature">
//                       <i className="fas fa-check-circle"></i>
//                       <span>Historical trend analysis</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PredictionPage;
