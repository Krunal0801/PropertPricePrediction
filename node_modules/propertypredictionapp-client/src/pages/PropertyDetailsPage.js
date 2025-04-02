import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropertyById } from '../services/property.service';
import { getPropertyAnalysis } from '../services/prediction.service';
import { bookmarkProperty, removeBookmark } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PropertyAmenities from '../components/property/PropertyAmenities';
import PropertyMap from '../components/property/PropertyMap';
import PropertyPriceChart from '../components/property/PropertyPriceChart';
import PropertyGallery from '../components/property/PropertyGallery';
import PropertyContactForm from '../components/property/PropertyContactForm';
import { 
  formatPrice, 
  formatArea, 
  formatDate, 
  getPropertyTypeDisplay,
  getFurnishStatusDisplay,
  getFacingDirectionDisplay
} from '../utils/format';
import './PropertyDetailsPage.css';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useNotification();
  
  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        
        const response = await getPropertyById(id);
        
        if (response.success) {
          setProperty(response.property);
          
          // Check if property is bookmarked
          if (isAuthenticated && user?.bookmarkedProperties) {
            setIsBookmarked(user.bookmarkedProperties.includes(id));
          }
        } else {
          showToast('Failed to fetch property details', 'error');
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        showToast('Failed to fetch property details', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [id, isAuthenticated, user, showToast]);
  
  // Fetch property analysis
  useEffect(() => {
    const fetchPropertyAnalysis = async () => {
      if (!property) return;
      
      try {
        setAnalysisLoading(true);
        
        const response = await getPropertyAnalysis(id);
        
        if (response.success) {
          setAnalysis(response.analysis);
        }
      } catch (error) {
        console.error('Error fetching property analysis:', error);
      } finally {
        setAnalysisLoading(false);
      }
    };
    
    fetchPropertyAnalysis();
  }, [id, property]);
  
  // Handle bookmark toggle
  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      showToast('Please login to bookmark properties', 'warning');
      return;
    }
    
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setIsBookmarked(false);
        showToast('Property removed from bookmarks', 'info');
      } else {
        await bookmarkProperty(id);
        setIsBookmarked(true);
        showToast('Property added to bookmarks', 'success');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showToast('Failed to update bookmark', 'error');
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="not-found-container">
        <h2>Property Not Found</h2>
        <p>The property you're looking for doesn't exist or has been removed.</p>
        <Link to="/search" className="btn-primary">
          Browse Properties
        </Link>
      </div>
    );
  }
  
  return (
    <div className="property-details-page">
      <div className="container">
        {/* Property Gallery */}
        <PropertyGallery property={property} />
        
        {/* Property Header */}
        <div className="property-header">
          <div className="property-header-left">
            <h1 className="property-title">{property.propHeading}</h1>
            <p className="property-location">
              <i className="fas fa-map-marker-alt"></i>
              {property.location?.localityName}, {property.city}
            </p>
          </div>
          
          <div className="property-header-right">
            <div className="property-price">{formatPrice(property.price)}</div>
            <div className="property-price-sqft">
              {formatPrice(property.pricePerUnitArea)} per sq.ft.
            </div>
            
            <button
              className={`bookmark-button ${isBookmarked ? 'active' : ''}`}
              onClick={handleToggleBookmark}
            >
              <i className={`${isBookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
        </div>
        
        {/* Property Content */}
        <div className="property-content">
          <div className="property-main">
            {/* Tabs Navigation */}
            <div className="property-tabs">
              <button
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => handleTabChange('details')}
              >
                Details
              </button>
              <button
                className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => handleTabChange('analysis')}
              >
                Price Analysis
              </button>
              <button
                className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => handleTabChange('map')}
              >
                Map & Nearby
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="tab-content">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="property-highlights">
                    <div className="highlight-item">
                      <div className="highlight-icon">
                        <i className="fas fa-home"></i>
                      </div>
                      <div className="highlight-label">Type</div>
                      <div className="highlight-value">
                        {getPropertyTypeDisplay(property.propertyType)}
                      </div>
                    </div>
                    
                    {property.bedroomNum && (
                      <div className="highlight-item">
                        <div className="highlight-icon">
                          <i className="fas fa-bed"></i>
                        </div>
                        <div className="highlight-label">Bedrooms</div>
                        <div className="highlight-value">
                          {property.bedroomNum} BHK
                        </div>
                      </div>
                    )}
                    
                    <div className="highlight-item">
                      <div className="highlight-icon">
                        <i className="fas fa-expand"></i>
                      </div>
                      <div className="highlight-label">Area</div>
                      <div className="highlight-value">
                        {formatArea(property.minAreaSqft)}
                      </div>
                    </div>
                    
                    <div className="highlight-item">
                      <div className="highlight-icon">
                        <i className="fas fa-couch"></i>
                      </div>
                      <div className="highlight-label">Furnishing</div>
                      <div className="highlight-value">
                        {getFurnishStatusDisplay(property.furnishStatus)}
                      </div>
                    </div>
                    
                    {property.facing && (
                      <div className="highlight-item">
                        <div className="highlight-icon">
                          <i className="fas fa-compass"></i>
                        </div>
                        <div className="highlight-label">Facing</div>
                        <div className="highlight-value">
                          {getFacingDirectionDisplay(property.facing)}
                        </div>
                      </div>
                    )}
                    
                    {property.floorNum && (
                      <div className="highlight-item">
                        <div className="highlight-icon">
                          <i className="fas fa-building"></i>
                        </div>
                        <div className="highlight-label">Floor</div>
                        <div className="highlight-value">
                          {property.floorNum} of {property.totalFloor}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="property-description">
                    <h2>Description</h2>
                    <p>{property.description}</p>
                  </div>
                  
                  <PropertyAmenities amenities={property.amenities} features={property.features} />
                </div>
              )}
              
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="details-tab">
                  <div className="property-details-list">
                    <h2>Property Details</h2>
                    
                    <div className="details-grid">
                      <div className="details-item">
                        <span className="details-label">Property ID:</span>
                        <span className="details-value">{property.propId}</span>
                      </div>
                      
                      <div className="details-item">
                        <span className="details-label">Property Type:</span>
                        <span className="details-value">{property.propertyType}</span>
                      </div>
                      
                      <div className="details-item">
                        <span className="details-label">Price:</span>
                        <span className="details-value">{formatPrice(property.price)}</span>
                      </div>
                      
                      <div className="details-item">
                        <span className="details-label">Price per sq.ft.:</span>
                        <span className="details-value">{formatPrice(property.pricePerUnitArea)}</span>
                      </div>
                      
                      <div className="details-item">
                        <span className="details-label">Area:</span>
                        <span className="details-value">{formatArea(property.minAreaSqft)}</span>
                      </div>
                      
                      {property.bedroomNum && (
                        <div className="details-item">
                          <span className="details-label">Bedrooms:</span>
                          <span className="details-value">{property.bedroomNum}</span>
                        </div>
                      )}
                      
                      {property.balconyNum && (
                        <div className="details-item">
                          <span className="details-label">Balconies:</span>
                          <span className="details-value">{property.balconyNum}</span>
                        </div>
                      )}
                      
                      {property.floorNum && (
                        <div className="details-item">
                          <span className="details-label">Floor:</span>
                          <span className="details-value">{property.floorNum} of {property.totalFloor}</span>
                        </div>
                      )}
                      
                      <div className="details-item">
                        <span className="details-label">Furnishing:</span>
                        <span className="details-value">{getFurnishStatusDisplay(property.furnishStatus)}</span>
                      </div>
                      
                      {property.facing && (
                        <div className="details-item">
                          <span className="details-label">Facing:</span>
                          <span className="details-value">{getFacingDirectionDisplay(property.facing)}</span>
                        </div>
                      )}
                      
                      {property.age !== undefined && property.age !== null && (
                        <div className="details-item">
                          <span className="details-label">Age:</span>
                          <span className="details-value">{property.age} years</span>
                        </div>
                      )}
                      
                      <div className="details-item">
                        <span className="details-label">City:</span>
                        <span className="details-value">{property.city}</span>
                      </div>
                      
                      <div className="details-item">
                        <span className="details-label">Locality:</span>
                        <span className="details-value">{property.location?.localityName}</span>
                      </div>
                      
                      {property.location?.societyName && (
                        <div className="details-item">
                          <span className="details-label">Society:</span>
                          <span className="details-value">{property.location.societyName}</span>
                        </div>
                      )}
                      
                      {property.location?.buildingName && (
                        <div className="details-item">
                          <span className="details-label">Building:</span>
                          <span className="details-value">{property.location.buildingName}</span>
                        </div>
                      )}
                      
                      <div className="details-item">
                        <span className="details-label">Listing Date:</span>
                        <span className="details-value">{formatDate(property.createdAt)}</span>
                      </div>
                      
                      <div className="details-item">
                        <span className="details-label">Last Updated:</span>
                        <span className="details-value">{formatDate(property.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Analysis Tab */}
              {activeTab === 'analysis' && (
                <div className="analysis-tab">
                  {analysisLoading ? (
                    <div className="loading-container">
                      <LoadingSpinner size="medium" />
                    </div>
                  ) : analysis ? (
                    <div className="property-analysis">
                      <h2>Price Analysis</h2>
                      
                      <div className="analysis-evaluation">
                        <div className={`evaluation-badge ${analysis.evaluation.priceEvaluation.toLowerCase().replace(' ', '-')}`}>
                          {analysis.evaluation.priceEvaluation}
                        </div>
                        
                        <div className="evaluation-details">
                          <div className="evaluation-title">Investment Rating: {analysis.evaluation.investmentRating}</div>
                          <ul className="evaluation-comments">
                            {analysis.evaluation.comments.map((comment, index) => (
                              <li key={index}>{comment}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="market-comparison">
                        <h3>Market Comparison</h3>
                        <p className="comparison-note">
                          Based on {analysis.marketComparison.similarProperties} similar properties in {analysis.marketComparison.comparisonLevel}
                        </p>
                        
                        <div className="comparison-grid">
                          <div className="comparison-item">
                            <div className="comparison-label">Average Price</div>
                            <div className="comparison-value">{formatPrice(analysis.marketComparison.avgPrice)}</div>
                            <div className={`comparison-diff ${analysis.marketComparison.priceDifference < 0 ? 'lower' : 'higher'}`}>
                              {analysis.marketComparison.priceDifference < 0 ? '↓' : '↑'} {Math.abs(analysis.marketComparison.priceDifference).toFixed(1)}%
                            </div>
                          </div>
                          
                          <div className="comparison-item">
                            <div className="comparison-label">Median Price</div>
                            <div className="comparison-value">{formatPrice(analysis.marketComparison.medianPrice)}</div>
                          </div>
                          
                          <div className="comparison-item">
                            <div className="comparison-label">Avg Price/sq.ft.</div>
                            <div className="comparison-value">{formatPrice(analysis.marketComparison.avgPricePerSqft)}</div>
                            <div className={`comparison-diff ${analysis.marketComparison.pricePerSqftDifference < 0 ? 'lower' : 'higher'}`}>
                              {analysis.marketComparison.pricePerSqftDifference < 0 ? '↓' : '↑'} {Math.abs(analysis.marketComparison.pricePerSqftDifference).toFixed(1)}%
                            </div>
                          </div>
                          
                          <div className="comparison-item">
                            <div className="comparison-label">Price Percentile</div>
                            <div className="comparison-value">{analysis.marketComparison.pricePercentile}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="price-forecast">
                        <h3>5-Year Price Forecast</h3>
                        <p className="forecast-growth">
                          Estimated Annual Growth: <span className="growth-rate">{analysis.forecast.annualGrowthRate}%</span>
                        </p>
                        
                        <PropertyPriceChart 
                          data={analysis.forecast.projectedValues}
                          currentPrice={property.price}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="no-analysis">
                      <p>Price analysis is not available for this property.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Map Tab */}
              {activeTab === 'map' && (
                <div className="map-tab">
                  <h2>Location & Nearby</h2>
                  
                  <PropertyMap 
                    latitude={property.mapDetails?.latitude} 
                    longitude={property.mapDetails?.longitude}
                    address={`${property.location?.localityName}, ${property.city}`}
                  />
                  
                  {property.landmarks && (
                    <div className="nearby-places">
                      <h3>Points of Interest Nearby</h3>
                      <div className="landmarks-list">
                        {property.formattedLandmarkDetails && 
                          JSON.parse(property.formattedLandmarkDetails).map((landmark, index) => (
                            <div key={index} className="landmark-item">
                              <i className="fas fa-map-pin"></i>
                              <span>{landmark.text}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="property-sidebar">
            <PropertyContactForm property={property} />
            
            <div className="similar-properties">
              <h3>Similar Properties</h3>
              <p>Contact us to explore more properties like this one.</p>
              <Link to={`/search?propertyType=${encodeURIComponent(property.propertyType)}&location=${encodeURIComponent(property.location?.localityName || '')}`} className="btn-secondary sidebar-button">
                View Similar Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
