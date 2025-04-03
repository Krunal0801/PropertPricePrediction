// client/src/pages/PredictionPage.js
import React, { useState, useEffect } from 'react';
import { getPricePrediction, getPriceTrends } from '../services/prediction.service';
import { getProperties } from '../services/property.service';
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
    years: 5
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [localities, setLocalities] = useState([]);
  const [trends, setTrends] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  
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
  
  // Years options
  const yearsOptions = [5, 10, 15, 20];
  
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
          // Extract unique localities
          const uniqueLocalities = [...new Set(
            response.properties
              .map(property => property.location?.localityName)
              .filter(Boolean)
          )];
          
          setLocalities(uniqueLocalities.sort());
        }
      } catch (error) {
        console.error('Error fetching localities:', error);
      }
    };
    
    fetchLocalities();
  }, [formData.city]);
  
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
    
    // if (!formData.locality) {
    //   showToast('Please select a locality', 'warning');
    //   return false;
    // }
    
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setPrediction(null);
    
    try {
      const response = await getPricePrediction({
        propertyType: formData.propertyType,
        city: formData.city,
        locality: formData.locality,
        bedroomNum: formData.bedroomNum ? parseInt(formData.bedroomNum) : null,
        furnishStatus: formData.furnishStatus ? parseInt(formData.furnishStatus) : 0,
        area: parseFloat(formData.area),
        years: parseInt(formData.years)
      });
      
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
  
  return (
    <div className="prediction-page">
      <div className="container">
        <div className="prediction-header">
          <h1 className="prediction-title">AI-Powered Price Prediction</h1>
          <p className="prediction-subtitle">
            Get accurate property price predictions for the next 5-20 years
            based on location, property type, and other factors.
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
                <p>Analyzing property data...</p>
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
                    These predictions are based on historical data and market trends. 
                    Actual prices may vary depending on various factors including
                    market conditions, property specifications, and economic changes.
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
                    the next {formData.years} years.
                  </p>
                  <div className="prediction-features">
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Location-based analysis</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Property type comparison</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Future price projections</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Historical trend analysis</span>
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
