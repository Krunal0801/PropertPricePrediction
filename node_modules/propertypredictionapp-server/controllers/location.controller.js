// server/controllers/location.controller.js
const axios = require('axios');
const config = require('../config/config');
const Property = require('../models/Property');

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

// Get POIs for a locality by name
exports.getPOIsByLocality = async (req, res) => {
  try {
    const { locality, city, radius = 2, types } = req.query;

    if (!locality || !city) {
      return res.status(400).json({
        success: false,
        message: 'Locality and city are required'
      });
    }

    // Find a property in the specified locality to get coordinates
    const property = await Property.findOne({
      'location.localityName': locality,
      city: city
    });

    if (!property || !property.mapDetails || !property.mapDetails.latitude || !property.mapDetails.longitude) {
      return res.status(404).json({
        success: false,
        message: 'No location data found for the specified locality'
      });
    }

    const latitude = parseFloat(property.mapDetails.latitude);
    const longitude = parseFloat(property.mapDetails.longitude);
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
          location: {
            locality,
            city,
            latitude,
            longitude
          },
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
      location: {
        locality,
        city,
        latitude,
        longitude
      },
      pois: mockPOIs
    });
  } catch (error) {
    console.error('Get POIs by locality error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch POIs for the specified locality',
      error: error.message
    });
  }
};

// Get location-based price impact factors
exports.getLocationFactors = async (req, res) => {
  try {
    const { lat, lng, radius = 2 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Get all important POI types
    const poiTypes = [
      'transit_station', 'metro_station', 'railway_station',
      'school', 'college', 'shopping_mall', 'supermarket',
      'hospital', 'park'
    ];

    // Get nearby POIs
    const pois = await getMockPOIs(latitude, longitude, searchRadius, poiTypes);

    // Calculate impact factors
    const factors = calculatePriceImpactFactors(pois);

    res.status(200).json({
      success: true,
      factors
    });
  } catch (error) {
    console.error('Get location factors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate location factors',
      error: error.message
    });
  }
};

// Calculate price impact factors based on POIs
function calculatePriceImpactFactors(pois) {
  // Group POIs by type
  const poiByType = {};
  pois.forEach(poi => {
    const mainType = poi.types[0];
    if (!poiByType[mainType]) {
      poiByType[mainType] = [];
    }
    poiByType[mainType].push(poi);
  });

  // Impact weights for different POI types
  const weights = {
    'transit_station': 0.15,
    'metro_station': 0.18,
    'railway_station': 0.15,
    'school': 0.12,
    'college': 0.10,
    'shopping_mall': 0.12,
    'supermarket': 0.08,
    'hospital': 0.08,
    'park': 0.07
  };

  // Calculate factors
  const factors = {
    transitAccessibility: calculateAccessibilityScore(
      [...(poiByType['transit_station'] || []), 
       ...(poiByType['metro_station'] || []),
       ...(poiByType['railway_station'] || [])]
    ),
    educationAccessibility: calculateAccessibilityScore(
      [...(poiByType['school'] || []), 
       ...(poiByType['college'] || [])]
    ),
    shoppingAccessibility: calculateAccessibilityScore(
      [...(poiByType['shopping_mall'] || []), 
       ...(poiByType['supermarket'] || [])]
    ),
    healthcareAccessibility: calculateAccessibilityScore(
      poiByType['hospital'] || []
    ),
    recreationAccessibility: calculateAccessibilityScore(
      poiByType['park'] || []
    ),
    overallAccessibility: 0
  };

  // Calculate overall accessibility score
  let overallScore = 0;
  let totalWeight = 0;

  for (const [type, typeWeight] of Object.entries(weights)) {
    if (poiByType[type] && poiByType[type].length > 0) {
      const typePois = poiByType[type];
      const typeScore = calculateAccessibilityScore(typePois);
      overallScore += typeScore * typeWeight;
      totalWeight += typeWeight;
    }
  }

  if (totalWeight > 0) {
    factors.overallAccessibility = Math.round(overallScore / totalWeight);
  }

  // Generate text ratings
  factors.transitConnectivity = getConnectivityRating(factors.transitAccessibility);
  factors.educationQuality = getQualityRating(factors.educationAccessibility);
  factors.shoppingConvenience = getConvenienceRating(factors.shoppingAccessibility);
  factors.healthcareAccess = getAccessRating(factors.healthcareAccessibility);
  factors.recreationOptions = getOptionRating(factors.recreationAccessibility);
  factors.overallRating = getOverallRating(factors.overallAccessibility);

  // Premium factor (0-1 multiplier for property value)
  factors.premiumFactor = calculatePremiumFactor(factors.overallAccessibility);

  return factors;
}

// Calculate accessibility score based on POIs and their distances
function calculateAccessibilityScore(pois) {
  if (!pois || pois.length === 0) return 0;

  let score = 0;

  // Scoring based on proximity
  pois.forEach(poi => {
    // Closer POIs get higher scores (inverse of distance, max 1.0)
    const distanceScore = Math.min(1.0, 1 / (poi.distance + 0.1));
    
    // Apply diminishing returns for multiple POIs
    score += distanceScore * (1 / Math.sqrt(pois.indexOf(poi) + 1));
  });

  // Normalize to a 0-100 scale
  const normalizedScore = Math.min(100, Math.round(score * 40));
  
  return normalizedScore;
}

// Get rating text based on score
function getConnectivityRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 50) return "Good";
  if (score >= 30) return "Fair";
  if (score >= 10) return "Poor";
  return "Very Poor";
}

function getQualityRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 50) return "Good";
  if (score >= 30) return "Average";
  if (score >= 10) return "Limited";
  return "Poor";
}

function getConvenienceRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Very Convenient";
  if (score >= 50) return "Convenient";
  if (score >= 30) return "Adequate";
  if (score >= 10) return "Limited";
  return "Inconvenient";
}

function getAccessRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 50) return "Good";
  if (score >= 30) return "Adequate";
  if (score >= 10) return "Limited";
  return "Poor";
}

function getOptionRating(score) {
  if (score >= 85) return "Abundant";
  if (score >= 70) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 30) return "Adequate";
  if (score >= 10) return "Limited";
  return "Very Limited";
}

function getOverallRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 50) return "Good";
  if (score >= 30) return "Fair";
  if (score >= 10) return "Below Average";
  return "Poor";
}

// Calculate premium factor for property valuation (0-1 multiplier)
function calculatePremiumFactor(accessibilityScore) {
  // Convert 0-100 score to a premium factor between 0-0.25
  // This means highly accessible areas can add up to 25% to property value
  const baseFactor = accessibilityScore / 400; // 0-0.25
  
  // Apply non-linear scaling to emphasize premium locations
  return Math.round((0.9 + baseFactor) * 100) / 100; // 0.9-1.15
}

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
  // Mumbai's major POIs
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
    {
      name: "Thane Railway Station",
      types: ["railway_station", "transit_station"],
      lat: 19.1857,
      lng: 72.9747,
    },
    {
      name: "Borivali Railway Station",
      types: ["railway_station", "transit_station"],
      lat: 19.2284,
      lng: 72.8567,
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
    {
      name: "Chakala Metro Station",
      types: ["metro_station", "transit_station"],
      lat: 19.1066,
      lng: 72.8582,
    },
    {
      name: "Airport Road Metro Station",
      types: ["metro_station", "transit_station"],
      lat: 19.0992,
      lng: 72.8679,
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
    {
      name: "Jamnabai Narsee School",
      types: ["school", "education"],
      lat: 19.1172,
      lng: 72.8363,
    },
    {
      name: "Dhirubhai Ambani International School",
      types: ["school", "education"],
      lat: 19.1134,
      lng: 72.8204,
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
    {
      name: "Mumbai University",
      types: ["college", "education"],
      lat: 19.0227,
      lng: 72.8562,
    },
    {
      name: "Tata Institute of Social Sciences",
      types: ["college", "education"],
      lat: 19.0428,
      lng: 72.9159,
    },
    
    // Shopping malls
    {
      name: "Infiniti Mall Andheri",
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
    {
      name: "High Street Phoenix",
      types: ["shopping_mall", "store"],
      lat: 18.9938,
      lng: 72.8258,
    },
    {
      name: "Inorbit Mall",
      types: ["shopping_mall", "store"],
      lat: 19.1367,
      lng: 72.8224,
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
    {
      name: "Big Bazaar Kurla",
      types: ["supermarket", "store"],
      lat: 19.0698,
      lng: 72.8866,
    },
    {
      name: "Nature's Basket Juhu",
      types: ["supermarket", "store"],
      lat: 19.0999,
      lng: 72.8310,
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
    {
      name: "Jaslok Hospital",
      types: ["hospital", "health"],
      lat: 18.9733,
      lng: 72.8074,
    },
    {
      name: "Nanavati Hospital",
      types: ["hospital", "health"],
      lat: 19.0844,
      lng: 72.8396,
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
    {
      name: "Juhu Beach",
      types: ["park", "tourist_attraction"],
      lat: 19.0948,
      lng: 72.8258,
    },
    {
      name: "Shivaji Park",
      types: ["park", "tourist_attraction"],
      lat: 19.0284,
      lng: 72.8383,
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
      lat, 
      lng, 
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
}

module.exports = {
  getNearbyPOIs: exports.getNearbyPOIs,
  getPOIsByLocality: exports.getPOIsByLocality,
  getLocationFactors: exports.getLocationFactors
};