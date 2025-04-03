// server/controllers/property.controller.js
const Property = require('../models/Property');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all properties with pagination and filtering
exports.getProperties = async (req, res) => {
  try {
    const {
      city,
      location,
      propertyType,
      bedroomNum,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      furnishStatus,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (city) query.city = city;
    if (location) query['location.localityName'] = { $regex: location, $options: 'i' };
    if (propertyType) query.propertyType = propertyType;
    if (bedroomNum) query.bedroomNum = parseInt(bedroomNum);

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // Area range
    if (minArea || maxArea) {
      query.minAreaSqft = {};
      if (minArea) query.minAreaSqft.$gte = parseFloat(minArea);
      if (maxArea) query.minAreaSqft.$lte = parseFloat(maxArea);
    }

    if (furnishStatus) query.furnishStatus = parseInt(furnishStatus);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const properties = await Property.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    // Save search query to user history if user is authenticated
    if (req.user) {
      const searchQuery = {
        city,
        location,
        propertyType,
        bedroomNum,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        furnishStatus
      };

      // Only save if there are actual search parameters
      if (Object.values(searchQuery).some(val => val !== undefined)) {
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            searchHistory: {
              query: searchQuery,
              timestamp: Date.now()
            }
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
};

// Get a single property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message
    });
  }
};

// Modified getTrendingProperties function for server/controllers/property.controller.js
exports.getTrendingProperties = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Find properties that are popular - modified to always return results
    // Even if no premium properties exist
    const trendingProperties = await Property.find({})
      .sort({ createdAt: -1, price: -1 })
      .limit(parseInt(limit));

    // If no properties found at all
    if (trendingProperties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No properties found'
      });
    }

    res.status(200).json({
      success: true,
      count: trendingProperties.length,
      properties: trendingProperties
    });
  } catch (error) {
    console.error('Get trending properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending properties',
      error: error.message
    });
  }
};

//Get trending properties based on various factors
// exports.getTrendingProperties = async (req, res) => {
//   try {
//     const { limit = 10 } = req.query;

//     // Find properties that are popular (premium listings, newer, higher-priced)
//     const trendingProperties = await Property.find({ isPremium: true })
//       .sort({ createdAt: -1, price: -1 })
//       .limit(parseInt(limit));

//     res.status(200).json({
//       success: true,
//       count: trendingProperties.length,
//       properties: trendingProperties
//     });
//   } catch (error) {
//     console.error('Get trending properties error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch trending properties',
//       error: error.message
//     });
//   }
// };
// exports.getTrendingProperties = async (req, res) => {
//   try {
//     const { limit = 10 } = req.query;

//     // Enhanced trending property criteria
//     const trendingProperties = await Property.aggregate([
//       {
//         $match: {
//           // Add more nuanced filtering criteria
//           $or: [
//             { isPremium: true },
//             { views: { $gte: 100 } },  // Properties with at least 100 views
//             { isHighlighted: true }     // Additional premium flag
//           ]
//         }
//       },
//       {
//         $addFields: {
//           // Create a trending score
//           trendingScore: {
//             $sum: [
//               { $ifNull: ["$views", 0] },
//               { $ifNull: ["$bookmarks", 0] } * 2,
//               { $cond: [{ $eq: ["$isPremium", true] }, 50, 0] }
//             ]
//           }
//         }
//       },
//       {
//         $sort: { 
//           trendingScore: -1,   // Sort by trending score
//           createdAt: -1,       // Then by most recent
//           price: -1            // Then by highest price
//         }
//       },
//       {
//         $limit: parseInt(limit)
//       },
//       {
//         $project: {
//           // Optionally exclude sensitive fields
//           __v: 0,
//           trendingScore: 0
//         }
//       }
//     ]);

//     // If no trending properties found
//     if (trendingProperties.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No trending properties found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: trendingProperties.length,
//       properties: trendingProperties
//     });

//     console.log('Trending Property Query Params:', req.query);
// console.log('Total Properties:', await Property.countDocuments());
//   } catch (error) {
//     console.error('Get trending properties error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch trending properties',
//       error: error.message
//     });
//   }
// };

// Get properties by location - for map view
exports.getPropertiesByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 2 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Convert to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(radius);

    // Approximate 1 degree of latitude/longitude to kilometers
    // This is a simplified approach - for more accuracy, use proper geospatial queries
    const latDiff = radiusInKm / 111; // 111 km per degree of latitude
    const lngDiff = radiusInKm / (111 * Math.cos(latitude * Math.PI / 180));

    // Find properties within the specified radius
    const properties = await Property.find({
      'mapDetails.latitude': { $gte: latitude - latDiff, $lte: latitude + latDiff },
      'mapDetails.longitude': { $gte: longitude - lngDiff, $lte: longitude + lngDiff }
    }).limit(100); // Limit to prevent overloading the map

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('Get properties by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties by location',
      error: error.message
    });
  }
};

// Get property statistics for data visualization
exports.getPropertyStats = async (req, res) => {
  try {
    // Get property count by type
    const propertyTypeStats = await Property.aggregate([
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgPricePerSqft: { $avg: '$pricePerUnitArea' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get property count by city
    const cityStats = await Property.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgPricePerSqft: { $avg: '$pricePerUnitArea' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get property count by bedroom
    const bedroomStats = await Property.aggregate([
      {
        $match: {
          bedroomNum: { $ne: null, $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$bedroomNum',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgPricePerSqft: { $avg: '$pricePerUnitArea' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Price range distribution
    const priceRangeStats = await Property.aggregate([
      {
        $facet: {
          budget: [
            { $match: { price: { $lt: 5000000 } } }, // Less than 50 Lakh
            { $count: 'count' }
          ],
          midRange: [
            { $match: { price: { $gte: 5000000, $lt: 10000000 } } }, // 50 Lakh to 1 Crore
            { $count: 'count' }
          ],
          premium: [
            { $match: { price: { $gte: 10000000, $lt: 30000000 } } }, // 1 Crore to 3 Crore
            { $count: 'count' }
          ],
          luxury: [
            { $match: { price: { $gte: 30000000 } } }, // 3 Crore and above
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        propertyTypeStats,
        cityStats,
        bedroomStats,
        priceRangeStats: priceRangeStats[0]
      }
    });
  } catch (error) {
    console.error('Get property stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property statistics',
      error: error.message
    });
  }
};

// Compare properties
exports.compareProperties = async (req, res) => {
  try {
    const { propertyIds } = req.body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two valid property IDs are required'
      });
    }

    // Validate IDs
    const validIds = propertyIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two valid property IDs are required'
      });
    }

    // Fetch properties
    const properties = await Property.find({
      _id: { $in: validIds }
    });

    if (properties.length < 2) {
      return res.status(404).json({
        success: false,
        message: 'At least two properties must be found to compare'
      });
    }

    res.status(200).json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Compare properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare properties',
      error: error.message
    });
  }
};

// Search properties with autocomplete functionality
exports.searchProperties = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search across multiple fields
    const properties = await Property.find({
      $or: [
        { propHeading: { $regex: query, $options: 'i' } },
        { 'location.localityName': { $regex: query, $options: 'i' } },
        { 'location.societyName': { $regex: query, $options: 'i' } },
        { 'location.buildingName': { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } }
      ]
    }).limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('Search properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search properties',
      error: error.message
    });
  }
};

// Filter properties by amenities
exports.filterByAmenities = async (req, res) => {
  try {
    const { amenities, page = 1, limit = 10 } = req.query;

    if (!amenities) {
      return res.status(400).json({
        success: false,
        message: 'Amenities are required'
      });
    }

    const amenitiesArray = amenities.split(',');
    
    // Create a regex pattern to match amenities
    const amenitiesRegex = amenitiesArray.map(amenity => 
      new RegExp(`${amenity}`)
    );

    const query = {
      amenities: { $regex: amenitiesRegex.join('|'), $options: 'i' }
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const properties = await Property.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      properties
    });
  } catch (error) {
    console.error('Filter by amenities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter properties by amenities',
      error: error.message
    });
  }
};