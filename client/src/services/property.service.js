// client/src/services/property.service.js
import api from './api';

// Get all properties with filtering
export const getProperties = async (params) => {
  try {
    const response = await api.get('/properties', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

// Get a single property by ID
export const getPropertyById = async (id) => {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error);
    throw error;
  }
};

// Get trending properties
export const getTrendingProperties = async (limit = 10) => {
  try {
    const response = await api.get('/properties/trending/list', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending properties:', error);
    throw error;
  }
};

// Get properties by location (for map view)
export const getPropertiesByLocation = async (lat, lng, radius = 2) => {
  try {
    const response = await api.get('/properties/map/nearby', {
      params: { lat, lng, radius }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties by location:', error);
    throw error;
  }
};

// Get properties within radius of coordinates
export const getNearbyProperties = async (lat, lng, radius = 2, limit = 20) => {
  try {
    const response = await api.get('/properties/map/nearby', {
      params: { lat, lng, radius, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby properties:', error);
    throw error;
  }
};

// Get property statistics
export const getPropertyStats = async () => {
  try {
    const response = await api.get('/properties/stats/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching property statistics:', error);
    throw error;
  }
};

// Compare properties
export const compareProperties = async (propertyIds) => {
  try {
    const response = await api.post('/properties/compare', { propertyIds });
    return response.data;
  } catch (error) {
    console.error('Error comparing properties:', error);
    throw error;
  }
};

// Search properties with autocomplete
export const searchProperties = async (query, limit = 10) => {
  try {
    const response = await api.get('/properties/search/autocomplete', {
      params: { query, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

// Filter properties by amenities
export const filterByAmenities = async (amenities, page = 1, limit = 10) => {
  try {
    const response = await api.get('/properties/filter/amenities', {
      params: { amenities, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error filtering properties by amenities:', error);
    throw error;
  }
};

// Get hotspot areas within a locality
export const getHotspotAreas = async (localityName, city, radius = 2) => {
  try {
    // First we need to find properties in this locality to get coordinates
    const localityResponse = await api.get('/properties', {
      params: { 
        location: localityName,
        city: city,
        limit: 1 
      }
    });
    
    if (!localityResponse.data.success || localityResponse.data.properties.length === 0) {
      throw new Error('No properties found in this locality');
    }
    
    // Get coordinates from the first property
    const property = localityResponse.data.properties[0];
    const lat = property.mapDetails?.latitude;
    const lng = property.mapDetails?.longitude;
    
    if (!lat || !lng) {
      throw new Error('Location coordinates not available for this locality');
    }
    
    // Now fetch nearby properties using these coordinates
    const response = await api.get('/properties/map/nearby', {
      params: { lat, lng, radius }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching hotspot areas:', error);
    throw error;
  }
};







// import api from './api';

// // Get all properties with filtering
// export const getProperties = async (params) => {
//   try {
//     const response = await api.get('/properties', { params });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching properties:', error);
//     throw error;
//   }
// };

// // Get a single property by ID
// export const getPropertyById = async (id) => {
//   try {
//     const response = await api.get(`/properties/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching property ${id}:`, error);
//     throw error;
//   }
// };

// // Get trending properties
// export const getTrendingProperties = async (limit = 10) => {
//   try {
//     const response = await api.get('/properties/trending/list', {
//       params: { limit }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching trending properties:', error);
//     throw error;
//   }
// };

// // Get properties by location (for map view)
// export const getPropertiesByLocation = async (lat, lng, radius = 2) => {
//   try {
//     const response = await api.get('/properties/map/nearby', {
//       params: { lat, lng, radius }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching properties by location:', error);
//     throw error;
//   }
// };

// // Get property statistics
// export const getPropertyStats = async () => {
//   try {
//     const response = await api.get('/properties/stats/overview');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching property statistics:', error);
//     throw error;
//   }
// };

// // Compare properties
// export const compareProperties = async (propertyIds) => {
//   try {
//     const response = await api.post('/properties/compare', { propertyIds });
//     return response.data;
//   } catch (error) {
//     console.error('Error comparing properties:', error);
//     throw error;
//   }
// };

// // Search properties with autocomplete
// export const searchProperties = async (query, limit = 10) => {
//   try {
//     const response = await api.get('/properties/search/autocomplete', {
//       params: { query, limit }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error searching properties:', error);
//     throw error;
//   }
// };

// // Filter properties by amenities
// export const filterByAmenities = async (amenities, page = 1, limit = 10) => {
//   try {
//     const response = await api.get('/properties/filter/amenities', {
//       params: { amenities, page, limit }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error filtering properties by amenities:', error);
//     throw error;
//   }
// };
