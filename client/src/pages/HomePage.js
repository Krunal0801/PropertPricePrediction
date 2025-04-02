import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingProperties } from '../services/property.service';
import { getPropertyStats } from '../services/property.service';
import PropertyCard from '../components/common/PropertyCard';
import PropertySearchForm from '../components/common/PropertySearchForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import './HomePage.css';

const HomePage = () => {
  const [trendingProperties, setTrendingProperties] = useState([]);
  const [propertyStats, setPropertyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState([]);
  const { showToast } = useNotification();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch trending properties
        const trendingResponse = await getTrendingProperties(6);
        if (trendingResponse.success) {
          setTrendingProperties(trendingResponse.properties);
        }
        
        // Fetch property statistics
        const statsResponse = await getPropertyStats();
        if (statsResponse.success) {
          setPropertyStats(statsResponse.stats);
        }
      } catch (error) {
        console.error('Error fetching home page data:', error);
        showToast('Failed to load some data. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [showToast]);
  
  const handleToggleBookmark = (propertyId) => {
    setBookmarked(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Find Your Dream Property</h1>
          <p className="hero-subtitle">Explore thousands of properties with AI-powered price predictions</p>
          
          <div className="search-container">
            <PropertySearchForm />
          </div>
        </div>
      </section>
      
      {/* Trending Properties Section */}
      <section className="trending-section container">
        <div className="section-header">
          <h2 className="section-title">Trending Properties</h2>
          <Link to="/search" className="view-all-link">View All Properties</Link>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="properties-grid">
            {trendingProperties.length > 0 ? (
              trendingProperties.map(property => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  isBookmarked={bookmarked.includes(property._id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))
            ) : (
              <div className="no-properties">
                <p>No trending properties available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose PropertyPredictor?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="feature-title">AI-Powered Price Predictions</h3>
              <p className="feature-description">
                Get accurate property price predictions for the next 5-10 years based on advanced AI algorithms.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-map-marked-alt"></i>
              </div>
              <h3 className="feature-title">Smart Location Analysis</h3>
              <p className="feature-description">
                Explore properties with detailed location analysis and nearby amenities within a 2km radius.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3 className="feature-title">Comprehensive Market Data</h3>
              <p className="feature-description">
                Access in-depth property market data with visualization tools to make informed decisions.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="feature-title">Real-time Updates</h3>
              <p className="feature-description">
                Get notified about new properties and price changes that match your preferences instantly.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      {propertyStats && (
        <section className="stats-section">
          <div className="container">
            <h2 className="section-title text-center">Property Market Insights</h2>
            
            <div className="stats-grid">
              <div className="stats-card">
                <h3 className="stats-title">Property Types</h3>
                <div className="stats-content">
                  {propertyStats.propertyTypeStats.slice(0, 5).map((stat, index) => (
                    <div key={index} className="stat-item">
                      <div className="stat-label">{stat._id}</div>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill"
                          style={{ 
                            width: `${(stat.count / propertyStats.propertyTypeStats[0].count) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="stat-value">{stat.count}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="stats-card">
                <h3 className="stats-title">Top Cities</h3>
                <div className="stats-content">
                  {propertyStats.cityStats.slice(0, 5).map((stat, index) => (
                    <div key={index} className="stat-item">
                      <div className="stat-label">{stat._id}</div>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill"
                          style={{ 
                            width: `${(stat.count / propertyStats.cityStats[0].count) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="stat-value">{stat.count}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="stats-card">
                <h3 className="stats-title">Price Distribution</h3>
                <div className="stats-content">
                  <div className="chart-container">
                    <div className="price-chart">
                      {Object.entries(propertyStats.priceRangeStats).map(([range, data], index) => {
                        const count = data[0]?.count || 0;
                        const maxCount = Math.max(
                          propertyStats.priceRangeStats.budget[0]?.count || 0,
                          propertyStats.priceRangeStats.midRange[0]?.count || 0,
                          propertyStats.priceRangeStats.premium[0]?.count || 0,
                          propertyStats.priceRangeStats.luxury[0]?.count || 0
                        );
                        
                        const labels = {
                          budget: 'Less than 50L',
                          midRange: '50L - 1Cr',
                          premium: '1Cr - 3Cr',
                          luxury: 'Above 3Cr'
                        };
                        
                        return (
                          <div key={index} className="price-bar-container">
                            <div 
                              className="price-bar"
                              style={{ height: `${(count / maxCount) * 100}%` }}
                            ></div>
                            <div className="price-label">{labels[range]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="stats-card">
                <h3 className="stats-title">Bedroom Distribution</h3>
                <div className="stats-content">
                  {propertyStats.bedroomStats.slice(0, 5).map((stat, index) => (
                    <div key={index} className="stat-item">
                      <div className="stat-label">{stat._id} BHK</div>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill"
                          style={{ 
                            width: `${(stat.count / propertyStats.bedroomStats[0].count) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="stat-value">{stat.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="stats-cta">
              <Link to="/prediction" className="btn-primary">Get Price Predictions</Link>
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to find your perfect property?</h2>
            <p className="cta-description">
              Join thousands of satisfied customers who have found their dream homes with PropertyPredictor.
            </p>
            <div className="cta-buttons">
              <Link to="/search" className="btn-primary cta-button">Explore Properties</Link>
              <Link to="/register" className="btn-secondary cta-button">Sign Up Now</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;