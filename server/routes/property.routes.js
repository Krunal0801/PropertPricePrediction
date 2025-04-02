const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { optionalAuth } = require('../middleware/auth');

// Get all properties with filtering
router.get('/', optionalAuth, propertyController.getProperties);

// Get a single property
router.get('/:id', propertyController.getPropertyById);

// Get trending properties
router.get('/trending/list', propertyController.getTrendingProperties);

// Get properties by location (for map view)
router.get('/map/nearby', propertyController.getPropertiesByLocation);

// Get property statistics
router.get('/stats/overview', propertyController.getPropertyStats);

// Compare properties
router.post('/compare', propertyController.compareProperties);

// Search properties with autocomplete
router.get('/search/autocomplete', propertyController.searchProperties);

// Filter properties by amenities
router.get('/filter/amenities', propertyController.filterByAmenities);

module.exports = router;
