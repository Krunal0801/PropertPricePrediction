// client/src/services/location.service.js
import api from './api';

// Get nearby points of interest
export const getNearbyPOIs = async (lat, lng, radius = 2, types = []) => {
  try {
    const response = await api.get('/location/pois', {
      params: { lat, lng, radius, types: types.join(',') }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby points of interest:', error);
    
    // For testing/development purposes, return mock data if the API fails
    return {
      success: true,
      pois: getMockPOIs(lat, lng, types)
    };
  }
};

// Calculate distance between two coordinates (in kilometers)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

// Mock data for points of interest (for development)
// You can replace this with actual API integration when ready
const getMockPOIs = (centerLat, centerLng, types = []) => {
  // Mock POIs in Mumbai for different categories
  const allPOIs = [
    // Railway stations
    {
      name: "Andheri Railway Station",
      types: ["railway_station", "transit_station"],
      lat: 19.1197,
      lng: 72.8466,
    },
    {
      name: "Bandra Railway Station",
      types: ["railway_station", "transit_station"],
      lat: 19.0543,
      lng: 72.8391,
    },
    {
      name: "Dadar Railway Station",
      types: ["railway_station", "transit_station"],
      lat: 19.0217,
      lng: 72.8438,
    },
    
    // Metro stations
    {
      name: "Andheri Metro Station",
      types: ["metro_station", "transit_station"],
      lat: 19.1198,
      lng: 72.8464,
    },
    {
      name: "Ghatkopar Metro Station",
      types: ["metro_station", "transit_station"],
      lat: 19.0866,
      lng: 72.9076,
    },
    {
      name: "Versova Metro Station",
      types: ["metro_station", "transit_station"],
      lat: 19.1312,
      lng: 72.8194,
    },
    
    // Schools
    {
      name: "Bombay Scottish School",
      types: ["school", "education"],
      lat: 19.0586,
      lng: 72.8315,
    },
    {
      name: "Ryan International School",
      types: ["school", "education"],
      lat: 19.1156,
      lng: 72.8368,
    },
    {
      name: "St. Xavier's High School",
      types: ["school", "education"],
      lat: 18.9423,
      lng: 72.8305,
    },
    
    // Colleges
    {
      name: "St. Xavier's College",
      types: ["college", "education"],
      lat: 18.9429,
      lng: 72.8297,
    },
    {
      name: "IIT Bombay",
      types: ["college", "education"],
      lat: 19.1334,
      lng: 72.9133,
    },
    {
      name: "NMIMS University",
      types: ["college", "education"],
      lat: 19.1037,
      lng: 72.8376,
    },
    
    // Shopping malls
    {
      name: "Infiniti Mall",
      types: ["shopping_mall", "store"],
      lat: 19.1364,
      lng: 72.8296,
    },
    {
      name: "Phoenix Marketcity",
      types: ["shopping_mall", "store"],
      lat: 19.0868,
      lng: 72.9091,
    },
    {
      name: "R City Mall",
      types: ["shopping_mall", "store"],
      lat: 19.0999,
      lng: 72.9288,
    },
    
    // Supermarkets
    {
      name: "D-Mart Powai",
      types: ["supermarket", "store"],
      lat: 19.1167,
      lng: 72.9089,
    },
    {
      name: "D-Mart Andheri",
      types: ["supermarket", "store"],
      lat: 19.1157,
      lng: 72.8422,
    },
    {
      name: "Reliance Fresh Bandra",
      types: ["supermarket", "store"],
      lat: 19.0613,
      lng: 72.8311,
    },
    
    // Hospitals
    {
      name: "Lilavati Hospital",
      types: ["hospital", "health"],
      lat: 19.0510,
      lng: 72.8266,
    },
    {
      name: "Kokilaben Hospital",
      types: ["hospital", "health"],
      lat: 19.1308,
      lng: 72.8252,
    },
    {
      name: "Hiranandani Hospital",
      types: ["hospital", "health"],
      lat: 19.1193,
      lng: 72.9126,
    },
    
    // Parks
    {
      name: "Sanjay Gandhi National Park",
      types: ["park", "tourist_attraction"],
      lat: 19.2147,
      lng: 72.8816,
    },
    {
      name: "Joggers Park",
      types: ["park", "tourist_attraction"],
      lat: 19.0645,
      lng: 72.8256,
    },
    {
      name: "Powai Garden",
      types: ["park", "tourist_attraction"],
      lat: 19.1219,
      lng: 72.9055,
    },
    
    // Restaurants
    {
      name: "The Table",
      types: ["restaurant", "food"],
      lat: 18.9221,
      lng: 72.8324,
    },
    {
      name: "Bastian",
      types: ["restaurant", "food"],
      lat: 19.0647,
      lng: 72.8289,
    },
    {
      name: "Masala Library",
      types: ["restaurant", "food"],
      lat: 19.1156,
      lng: 72.8323,
    }
  ];
  
  // Filter POIs by type if specified
  let filteredPOIs = allPOIs;
  if (types && types.length > 0) {
    filteredPOIs = allPOIs.filter(poi => {
      return poi.types.some(type => types.includes(type));
    });
  }
  
  // Calculate distance from center and filter by radius
  const result = filteredPOIs.map(poi => {
    const distance = calculateDistance(
      centerLat, 
      centerLng, 
      poi.lat, 
      poi.lng
    );
    
    return {
      ...poi,
      distance
    };
  }).filter(poi => poi.distance <= radius)
  .sort((a, b) => a.distance - b.distance);
  
  return result;
};

// Get a score for the accessibility of a location
// Higher score means better access to amenities
export const getAccessibilityScore = (pois) => {
  if (!pois || pois.length === 0) return 0;
  
  // Define weights for different types of POIs
  const weights = {
    'transit_station': 10,
    'metro_station': 15,
    'railway_station': 12,
    'school': 8,
    'college': 7,
    'shopping_mall': 9,
    'supermarket': 8,
    'hospital': 7,
    'park': 6,
    'restaurant': 5
  };
  
  let score = 0;
  const typeCounts = {};
  
  // Calculate scores based on proximity and type
  pois.forEach(poi => {
    const type = poi.types[0];
    const weight = weights[type] || 5;
    
    // Closer POIs get higher scores (inverse of distance, max 1.0)
    const proximityScore = Math.min(1.0, 1 / (poi.distance + 0.1));
    
    // Add to score, but with diminishing returns for multiple of same type
    if (!typeCounts[type]) {
      typeCounts[type] = 1;
      score += weight * proximityScore;
    } else {
      typeCounts[type]++;
      // Apply diminishing returns for multiple POIs of same type
      score += weight * proximityScore * (1 / typeCounts[type]);
    }
  });
  
  // Normalize score to be out of 100
  const normalizedScore = Math.min(100, Math.round(score * 5));
  
  return normalizedScore;
};

// Get transit connectivity rating based on nearby transit stations
export const getTransitConnectivityRating = (pois) => {
  if (!pois || pois.length === 0) return "Poor";
  
  // Filter only transit stations
  const transitStations = pois.filter(poi => 
    poi.types.includes('transit_station') || 
    poi.types.includes('metro_station') || 
    poi.types.includes('railway_station') || 
    poi.types.includes('bus_station')
  );
  
  // Count stations by distance
  const nearbyStations = transitStations.filter(poi => poi.distance <= 0.5).length;
  const mediumDistanceStations = transitStations.filter(poi => poi.distance > 0.5 && poi.distance <= 1).length;
  const farStations = transitStations.filter(poi => poi.distance > 1 && poi.distance <= 2).length;
  
  // Weight stations by distance
  const weightedCount = (nearbyStations * 3) + (mediumDistanceStations * 2) + farStations;
  
  // Determine rating based on weighted count
  if (weightedCount >= 10) return "Excellent";
  if (weightedCount >= 7) return "Very Good";
  if (weightedCount >= 5) return "Good";
  if (weightedCount >= 3) return "Fair";
  if (weightedCount >= 1) return "Poor";
  
  return "Very Poor";
};

export default {
  getNearbyPOIs,
  calculateDistance,
  getAccessibilityScore,
  getTransitConnectivityRating
};