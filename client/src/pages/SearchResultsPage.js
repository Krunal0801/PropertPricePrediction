import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProperties } from '../services/property.service';
import PropertyCard from '../components/common/PropertyCard';
import PropertySearchForm from '../components/common/PropertySearchForm';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarked, setBookmarked] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  
  // Get search params from URL
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query');
  const city = searchParams.get('city');
  const propertyLocation = searchParams.get('location');
  const propertyType = searchParams.get('propertyType');
  const bedroomNum = searchParams.get('bedroomNum');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minArea = searchParams.get('minArea');
  const maxArea = searchParams.get('maxArea');
  const furnishStatus = searchParams.get('furnishStatus');
  
  // Initial search parameters
  const initialSearchValues = {
    city: city || '',
    location: propertyLocation || '',
    propertyType: propertyType || '',
    bedroomNum: bedroomNum || '',
    minPrice: minPrice || '',
    maxPrice: maxPrice || '',
    minArea: minArea || '',
    maxArea: maxArea || '',
    furnishStatus: furnishStatus || ''
  };
  
  // Fetch properties based on search params
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Build search parameters for API call
        const params = {
          page: currentPage,
          limit: 12,
          sortBy,
          sortOrder
        };
        
        // Add search query if present
        if (query) {
          params.query = query;
        }
        
        // Add other filter parameters if present
        if (city) params.city = city;
        if (propertyLocation) params.location = propertyLocation;
        if (propertyType) params.propertyType = propertyType;
        if (bedroomNum) params.bedroomNum = bedroomNum;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minArea) params.minArea = minArea;
        if (maxArea) params.maxArea = maxArea;
        if (furnishStatus) params.furnishStatus = furnishStatus;
        
        const response = await getProperties(params);
        
        if (response.success) {
          setProperties(response.properties);
          setTotalProperties(response.total);
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        showToast('Failed to fetch properties. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [
    query, city, propertyLocation, propertyType, bedroomNum, 
    minPrice, maxPrice, minArea, maxArea, furnishStatus,
    currentPage, sortBy, sortOrder, showToast
  ]);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Scroll to top of results
    window.scrollTo({
      top: document.querySelector('.search-results-section').offsetTop - 100,
      behavior: 'smooth'
    });
  };
  
  // Handle sorting change
  const handleSortChange = (e) => {
    const value = e.target.value;
    
    // Parse sort option (format: "field_order")
    const [field, order] = value.split('_');
    
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Handle bookmark toggle
  const handleToggleBookmark = (propertyId) => {
    setBookmarked(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };
  
  // Build page title based on search params
  const getPageTitle = () => {
    let title = 'Properties';
    
    if (propertyType) {
      title = `${propertyType}s`;
    }
    
    if (bedroomNum) {
      title = `${bedroomNum} BHK ${title}`;
    }
    
    if (propertyLocation) {
      title += ` in ${propertyLocation}`;
    } else if (city) {
      title += ` in ${city}`;
    }
    
    if (query) {
      title = `Search Results for "${query}"`;
    }
    
    return title;
  };
  
  return (
    <div className="search-results-page">
      {/* Search Form Section */}
      <section className="search-form-section">
        <PropertySearchForm initialValues={initialSearchValues} />
      </section>
      
      {/* Search Results Section */}
      <section className="search-results-section">
        <div className="container">
          <div className="results-header">
            <h1 className="results-title">{getPageTitle()}</h1>
            
            <div className="results-meta">
              {!loading && (
                <div className="results-count">
                  {totalProperties} {totalProperties === 1 ? 'property' : 'properties'} found
                </div>
              )}
              
              <div className="results-controls">
                <div className="sort-control">
                  <label htmlFor="sort-select">Sort by:</label>
                  <select
                    id="sort-select"
                    value={`${sortBy}_${sortOrder}`}
                    onChange={handleSortChange}
                    className="sort-select"
                  >
                    <option value="createdAt_desc">Newest First</option>
                    <option value="createdAt_asc">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="minAreaSqft_asc">Area: Small to Large</option>
                    <option value="minAreaSqft_desc">Area: Large to Small</option>
                  </select>
                </div>
                
                <div className="view-mode-control">
                  <button
                    className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('grid')}
                    aria-label="Grid view"
                  >
                    <i className="fas fa-th-large"></i>
                  </button>
                  <button
                    className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('list')}
                    aria-label="List view"
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <>
              {properties.length > 0 ? (
                <div className={`properties-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                  {properties.map(property => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      isBookmarked={bookmarked.includes(property._id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <h2>No properties found</h2>
                  <p>
                    We couldn't find any properties matching your search criteria. 
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              )}
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchResultsPage;