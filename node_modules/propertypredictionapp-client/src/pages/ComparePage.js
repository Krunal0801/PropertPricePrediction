import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { compareProperties, getPropertyById } from '../services/property.service';
import { useNotification } from '../context/NotificationContext';
import { getPropertyAnalysis } from '../services/prediction.service';
import { 
  formatPrice, 
  formatArea, 
  formatDate,
  getFurnishStatusDisplay,
  getFacingDirectionDisplay
} from '../utils/format';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ComparePage.css';

const ComparePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertyId, setPropertyId] = useState('');
  const [analysisData, setAnalysisData] = useState({});
  const [analysisLoading, setAnalysisLoading] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  
  // Get property IDs from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const ids = searchParams.get('ids');
    
    if (ids) {
      const propertyIds = ids.split(',');
      fetchProperties(propertyIds);
    }
  }, [location.search]);
  
  // Fetch properties for comparison
  const fetchProperties = async (propertyIds) => {
    try {
      setLoading(true);
      
      const response = await compareProperties(propertyIds);
      
      if (response.success) {
        setProperties(response.properties);
        
        // Initialize analysis loading state for each property
        const analysisLoadingState = {};
        response.properties.forEach(property => {
          analysisLoadingState[property._id] = false;
        });
        setAnalysisLoading(analysisLoadingState);
      } else {
        showToast('Failed to fetch properties for comparison', 'error');
      }
    } catch (error) {
      console.error('Error fetching properties for comparison:', error);
      showToast('Failed to fetch properties for comparison', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch property analysis
  const fetchPropertyAnalysis = async (propertyId) => {
    if (analysisData[propertyId] || analysisLoading[propertyId]) {
      return;
    }
    
    try {
      setAnalysisLoading(prev => ({ ...prev, [propertyId]: true }));
      
      const response = await getPropertyAnalysis(propertyId);
      
      if (response.success) {
        setAnalysisData(prev => ({ ...prev, [propertyId]: response.analysis }));
      }
    } catch (error) {
      console.error(`Error fetching analysis for property ${propertyId}:`, error);
    } finally {
      setAnalysisLoading(prev => ({ ...prev, [propertyId]: false }));
    }
  };
  
  // Add property to comparison
  const handleAddProperty = async () => {
    if (!propertyId.trim()) {
      showToast('Please enter a property ID', 'warning');
      return;
    }
    
    // Check if property is already in comparison
    if (properties.some(p => p._id === propertyId)) {
      showToast('This property is already in the comparison', 'warning');
      setPropertyId('');
      return;
    }
    
    try {
      const response = await getPropertyById(propertyId);
      
      if (response.success) {
        // Add property to comparison
        setProperties(prev => [...prev, response.property]);
        
        // Update URL
        const ids = [...properties.map(p => p._id), response.property._id].join(',');
        navigate(`/compare?ids=${ids}`);
        
        setPropertyId('');
      } else {
        showToast('Property not found', 'error');
      }
    } catch (error) {
      console.error('Error adding property to comparison:', error);
      showToast('Failed to add property to comparison', 'error');
    }
  };
  
  // Remove property from comparison
  const handleRemoveProperty = (propertyId) => {
    const updatedProperties = properties.filter(p => p._id !== propertyId);
    setProperties(updatedProperties);
    
    // Update URL
    if (updatedProperties.length > 0) {
      const ids = updatedProperties.map(p => p._id).join(',');
      navigate(`/compare?ids=${ids}`);
    } else {
      navigate('/compare');
    }
    
    // Remove analysis data for this property
    const updatedAnalysisData = { ...analysisData };
    delete updatedAnalysisData[propertyId];
    setAnalysisData(updatedAnalysisData);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="compare-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Compare Properties</h1>
          <p className="page-subtitle">
            View multiple properties side by side to make an informed decision
          </p>
        </div>
        
        <div className="add-property-form">
          <div className="form-group">
            <input
              type="text"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="Enter property ID to compare"
              className="form-control"
            />
          </div>
          <button
            onClick={handleAddProperty}
            className="btn-primary"
          >
            Add Property
          </button>
        </div>
        
        {properties.length === 0 ? (
          <div className="no-properties">
            <div className="no-properties-icon">
              <i className="fas fa-balance-scale"></i>
            </div>
            <h2>No Properties to Compare</h2>
            <p>
              Add properties to compare by entering their IDs above or by selecting 
              "Compare" from property details pages.
            </p>
          </div>
        ) : (
          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="feature-column">Features</th>
                  {properties.map(property => (
                    <th key={property._id} className="property-column">
                      <div className="property-header">
                        <h3>{property.propHeading}</h3>
                        <button
                          className="remove-property-button"
                          onClick={() => handleRemoveProperty(property._id)}
                          aria-label="Remove property"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {/* Basic Info */}
                <tr className="section-header">
                  <td colSpan={properties.length + 1}>Basic Information</td>
                </tr>
                
                <tr>
                  <td>Price</td>
                  {properties.map(property => (
                    <td key={property._id}>{formatPrice(property.price)}</td>
                  ))}
                </tr>
                
                <tr>
                  <td>Price per sq.ft.</td>
                  {properties.map(property => (
                    <td key={property._id}>{formatPrice(property.pricePerUnitArea)}</td>
                  ))}
                </tr>
                
                <tr>
                  <td>Property Type</td>
                  {properties.map(property => (
                    <td key={property._id}>{property.propertyType}</td>
                  ))}
                </tr>
                
                <tr>
                  <td>Location</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {property.location?.localityName}, {property.city}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>Area</td>
                  {properties.map(property => (
                    <td key={property._id}>{formatArea(property.minAreaSqft)}</td>
                  ))}
                </tr>
                
                {/* Property Details */}
                <tr className="section-header">
                  <td colSpan={properties.length + 1}>Property Details</td>
                </tr>
                
                <tr>
                  <td>Bedrooms</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {property.bedroomNum ? `${property.bedroomNum} BHK` : 'N/A'}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>Balconies</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {property.balconyNum || 'N/A'}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>Floor</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {property.floorNum ? `${property.floorNum} of ${property.totalFloor}` : 'N/A'}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>Furnishing</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {getFurnishStatusDisplay(property.furnishStatus)}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>Facing</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {property.facing ? getFacingDirectionDisplay(property.facing) : 'N/A'}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>Property Age</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {property.age !== undefined && property.age !== null ? 
                        `${property.age} years` : 'N/A'}
                    </td>
                  ))}
                </tr>
                
                {/* Price Analysis */}
                <tr className="section-header">
                  <td colSpan={properties.length + 1}>
                    Price Analysis
                    <button 
                      className="analysis-button"
                      onClick={() => {
                        properties.forEach(property => {
                          fetchPropertyAnalysis(property._id);
                        });
                      }}
                    >
                      Analyze All
                    </button>
                  </td>
                </tr>
                
                <tr>
                  <td>Current Market Value</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {analysisLoading[property._id] ? (
                        <LoadingSpinner size="small" />
                      ) : analysisData[property._id] ? (
                        formatPrice(analysisData[property._id].marketComparison.avgPrice)
                      ) : (
                        <button 
                          className="analyze-button"
                          onClick={() => fetchPropertyAnalysis(property._id)}
                        >
                          Analyze
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>Price Evaluation</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {analysisLoading[property._id] ? (
                        <LoadingSpinner size="small" />
                      ) : analysisData[property._id] ? (
                        <span className={`evaluation-tag ${analysisData[property._id].evaluation.priceEvaluation.toLowerCase().replace(' ', '-')}`}>
                          {analysisData[property._id].evaluation.priceEvaluation}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>Investment Rating</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {analysisLoading[property._id] ? (
                        <LoadingSpinner size="small" />
                      ) : analysisData[property._id] ? (
                        analysisData[property._id].evaluation.investmentRating
                      ) : (
                        'N/A'
                      )}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td>5 Year Forecast</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      {analysisLoading[property._id] ? (
                        <LoadingSpinner size="small" />
                      ) : analysisData[property._id] ? (
                        formatPrice(analysisData[property._id].forecast.projectedValues[4].projectedPrice)
                      ) : (
                        'N/A'
                      )}
                    </td>
                  ))}
                </tr>
                
                {/* Actions */}
                <tr className="section-header">
                  <td colSpan={properties.length + 1}>Actions</td>
                </tr>
                
                <tr>
                  <td>View Details</td>
                  {properties.map(property => (
                    <td key={property._id}>
                      <a 
                        href={`/property/${property._id}`}
                        className="action-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Property
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
