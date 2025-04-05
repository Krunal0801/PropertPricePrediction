// server/routes/location.routes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { optionalAuth } = require('../middleware/auth');

// Get nearby points of interest
router.get('/pois', optionalAuth, locationController.getNearbyPOIs);

module.exports = router;

// --------------------

// server/controllers/location.controller.js
const axios = require('axios');
const config = require('../config/config');

// Calculate distance between two coordinates (using Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Get nearby points of interest
exports.getNearbyPOIs = async (req, res) => {
  try {
    const { lat, lng, radius = 2, types } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Type filtering
    const poiTypes = types ? types.split(',') : [];

    // Call Google Places API if API key is available
    if (config.googleMaps && config.googleMaps.apiKey) {
      try {
        const pois = await fetchFromGooglePlaces(
          latitude, 
          longitude, 
          searchRadius, 
          poiTypes,
          config.googleMaps.apiKey
        );
        
        return res.status(200).json({
          success: true,
          pois
        });
      } catch (error) {
        console.error('Error fetching from Google Places API:', error);
        // Fall back to mock data
      }
    }

    // If no API key or Google API call failed, use mock data
    const mockPOIs = getMockPOIs(latitude, longitude, searchRadius, poiTypes);
    
    res.status(200).json({
      success: true,
      pois: mockPOIs
    });
  } catch (error) {
    console.error('Get nearby POIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby points of interest',
      error: error.message
    });
  }
};

// Fetch from Google Places API
async function fetchFromGooglePlaces(lat, lng, radius, types, apiKey) {
  // Convert radius from km to meters
  const radiusInMeters = radius * 1000;
  
  // Map our types to Google Places types
  const typeMapping = {
    'railway_station': 'train_station',
    'metro_station': 'subway_station',
    'transit_station': 'transit_station',
    'school': 'school',
    'college': 'university',
    'shopping_mall': 'shopping_mall',
    'supermarket': 'supermarket',
    'hospital': 'hospital',
    'park': 'park',
    'restaurant': 'restaurant'
  };
  
  const results = [];
  
  // For each type, make a separate API call
  for (const type of types) {
    const googleType = typeMapping[type] || type;
    
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
          params: {
            location: `${lat},${lng}`,
            radius: radiusInMeters,
            type: googleType,
            key: apiKey
          }
        }
      );
      
      if (response.data.status === 'OK' && response.data.results) {
        // Process and map Google Places results to our format
        const placesResults = response.data.results.map(place => ({
          name: place.name,
          types: place.types.includes(googleType) 
            ? [type, ...place.types.filter(t => t !== googleType)]
            : [type, ...place.types],
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          distance: calculateDistance(
            lat, 
            lng, 
            place.geometry.location.lat, 
            place.geometry.location.lng
          ),
          rating: place.rating,
          address: place.vicinity
        }));
        
        results.push(...placesResults);
      }
    } catch (error) {
      console.error(`Error fetching ${type} from Google Places:`, error);
    }
  }
  
  // Sort by distance and remove duplicates
  return results
    .sort((a, b) => a.distance - b.distance)
    .filter((poi, index, self) => 
      index === self.findIndex((t) => t.name === poi.name)
    );
}

// Mock POI data for testing/development
function getMockPOIs(lat, lng, radius, types) {
  // This would contain the same mock data as in the client-side service
  // Simplified version shown here
  const mockData = [
    {
      name: "Andheri Railway Station",
      types: ["railway_station", "transit_station"],
      lat: 19.1197,
      lng: 72.8466,
    },
    {
      name: "D-Mart Andheri",
      types: ["supermarket", "store"],
      lat: 19.1157,
      lng: 72.8422,
    },
    {
      name: "Ryan International School",
      types: ["school", "education"],
      lat: 19.1156,
      lng: 72.8368,
    },
    // Add more mock data as needed
  ];
  
  // Filter by type and distance
  return mockData
    .filter(poi => {
      // If no types specified, include all
      if (!types.length) return true;
      
      // Check if any of the POI's types match the requested types
      return poi.types.some(type => types.includes(type));
    })
    .map(poi => {
      // Calculate distance
      const distance = calculateDistance(lat, lng, poi.lat, poi.lng);
      return { ...poi, distance };
    })
    .filter(poi => poi.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}