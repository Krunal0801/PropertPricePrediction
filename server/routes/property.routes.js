// server/routes/property.routes.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { optionalAuth } = require('../middleware/auth');

// Get all properties with filtering
router.get('/', optionalAuth, propertyController.getProperties);

// Get trending properties - MOVED UP before /:id
router.get('/trending/list', propertyController.getTrendingProperties);

// Get properties by location (for map view)
router.get('/map/nearby', propertyController.getPropertiesByLocation);

// Get property statistics
router.get('/stats/overview', propertyController.getPropertyStats);

// Search properties with autocomplete
router.get('/search/autocomplete', propertyController.searchProperties);

// Filter properties by amenities
router.get('/filter/amenities', propertyController.filterByAmenities);

// Compare properties
router.post('/compare', propertyController.compareProperties);

// Get a single property - MOVED DOWN to ensure specific routes match first
router.get('/:id', propertyController.getPropertyById);

module.exports = router;