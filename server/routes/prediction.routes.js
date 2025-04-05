// // server/routes/prediction.routes.js
// const express = require('express');
// const router = express.Router();
// const predictionController = require('../controllers/prediction.controller');
// const { auth, verifiedUser } = require('../middleware/auth');

// // Get price prediction
// router.post('/price', predictionController.getPricePrediction);

// // Get property recommendations
// router.get('/recommendations', auth, predictionController.getRecommendations);

// // Get price trends
// router.get('/trends', predictionController.getPriceTrends);

// // Get property analysis
// router.get('/analysis/:id', predictionController.getPropertyAnalysis);

// module.exports = router;

// server/routes/prediction.routes.js
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');
const { auth, optionalAuth } = require('../middleware/auth');

// Get price prediction
router.post('/price', predictionController.getPricePrediction);

// Get property recommendations
router.get('/recommendations', auth, predictionController.getRecommendations);

// Get price trends
router.get('/trends', predictionController.getPriceTrends);

// Get property analysis
router.get('/analysis/:id', predictionController.getPropertyAnalysis);

module.exports = router;