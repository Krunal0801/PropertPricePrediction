// server/controllers/prediction.controller.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Property = require('../models/Property');
const User = require('../models/User');
const PredictionModel = require('../models/PredictionModel');
const config = require('../config/config');

// Get price prediction for a property
exports.getPricePrediction = async (req, res) => {
  try {
    // ...existing code...

    // Create temporary file with the data
    const tempFile = path.join(__dirname, '../python/temp', `prediction_data_${Date.now()}.json`);
    console.log(`Creating temp file: ${tempFile}`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempFile);
    console.log(`Temp directory: ${tempDir}`);
    
    if (!fs.existsSync(tempDir)) {
      console.log(`Creating temp directory: ${tempDir}`);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempFile, predictionData);
    console.log('Temp file created successfully');

    // Call Python script
    // const pythonScript = path.join(__dirname, '../python/price_prediction.py');
    const pythonScript = path.join(__dirname, '../python/new_price_prediction.py');
    console.log(`Python script path: ${pythonScript}`);
    console.log(`Python executable: ${config.python.path}`);
    
    const pythonProcess = spawn(config.python.path, [pythonScript, tempFile]);
    console.log('Python process spawned');

    // ...rest of the code...
  } catch (error) {
    console.error('Price prediction error:', error);
    // ...rest of error handling...
  }
};
// exports.getPricePrediction = async (req, res) => {
//   try {
//     const {
//       propertyType,
//       city,
//       locality,
//       bedroomNum,
//       furnishStatus,
//       area,
//       years = 5
//     } = req.body;

//     // Validate required fields
//     if (!propertyType || !city || !locality || !area) {
//       return res.status(400).json({
//         success: false,
//         message: 'Property type, city, locality, and area are required'
//       });
//     }

//     // Prepare data for Python script
//     const predictionData = JSON.stringify({
//       propertyType,
//       city,
//       locality,
//       bedroomNum: bedroomNum || null,
//       furnishStatus: furnishStatus || 0,
//       area: parseFloat(area),
//       years: parseInt(years)
//     });

//     // Create temporary file with the data
//     const tempFile = path.join(__dirname, '../python/temp', `prediction_data_${Date.now()}.json`);
    
//     // Ensure temp directory exists
//     const tempDir = path.dirname(tempFile);
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }
    
//     fs.writeFileSync(tempFile, predictionData);

//     // Call Python script
//     const pythonScript = path.join(__dirname, '../python/price_prediction.py');
//     const pythonProcess = spawn(config.python.path, [pythonScript, tempFile]);

//     let predictionResult = '';
//     let errorOutput = '';

//     // Collect output from Python script
//     pythonProcess.stdout.on('data', (data) => {
//       predictionResult += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       errorOutput += data.toString();
//     });

//     // Handle process completion
//     pythonProcess.on('close', (code) => {
//       // Clean up temp file
//       if (fs.existsSync(tempFile)) {
//         fs.unlinkSync(tempFile);
//       }

//       if (code !== 0) {
//         console.error(`Python process exited with code ${code}`, errorOutput);
//         return res.status(500).json({
//           success: false,
//           message: 'Price prediction failed',
//           error: errorOutput
//         });
//       }

//       try {
//         const predictions = JSON.parse(predictionResult);

//         res.status(200).json({
//           success: true,
//           predictions
//         });
//       } catch (error) {
//         console.error('Error parsing prediction result:', error);
//         res.status(500).json({
//           success: false,
//           message: 'Failed to parse prediction result',
//           error: error.message
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Price prediction error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Price prediction failed',
//       error: error.message
//     });
//   }
// };

// Get property recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user search history and preferences
    const user = await User.findById(req.user.id).select('searchHistory');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare data for Python script
    const searchHistory = user.searchHistory.map(item => item.query);
    
    // Create temporary file with the data
    const tempFile = path.join(__dirname, '../python/temp', `recommendation_data_${Date.now()}.json`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempFile);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempFile, JSON.stringify({ searchHistory }));

    // Call Python script
    const pythonScript = path.join(__dirname, '../python/recommendation.py');
    const pythonProcess = spawn(config.python.path, [pythonScript, tempFile]);

    let recommendationResult = '';
    let errorOutput = '';

    // Collect output from Python script
    pythonProcess.stdout.on('data', (data) => {
      recommendationResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', async (code) => {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      if (code !== 0) {
        console.error(`Python process exited with code ${code}`, errorOutput);
        return res.status(500).json({
          success: false,
          message: 'Recommendation failed',
          error: errorOutput
        });
      }

      try {
        const recommendationData = JSON.parse(recommendationResult);
        
        // Get property recommendations based on the data
        const properties = await Property.find({
          $or: recommendationData.queries.map(query => {
            const filter = {};
            
            if (query.city) filter.city = query.city;
            if (query.propertyType) filter.propertyType = query.propertyType;
            if (query.bedroomNum) filter.bedroomNum = parseInt(query.bedroomNum);
            
            // Location
            if (query.location) {
              filter['location.localityName'] = { $regex: query.location, $options: 'i' };
            }
            
            // Price range
            if (query.minPrice || query.maxPrice) {
              filter.price = {};
              if (query.minPrice) filter.price.$gte = parseInt(query.minPrice);
              if (query.maxPrice) filter.price.$lte = parseInt(query.maxPrice);
            }
            
            return filter;
          })
        }).limit(10);

        res.status(200).json({
          success: true,
          count: properties.length,
          properties
        });
      } catch (error) {
        console.error('Error parsing recommendation result:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to parse recommendation result',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Recommendation failed',
      error: error.message
    });
  }
};

// Get price trend analysis
exports.getPriceTrends = async (req, res) => {
  try {
    const { city, propertyType, period = 5 } = req.query;

    // Validate required fields
    if (!city || !propertyType) {
      return res.status(400).json({
        success: false,
        message: 'City and property type are required'
      });
    }

    // Call Python script for trend analysis
    const pythonScript = path.join(__dirname, '../python/price_trend.py');
    const pythonProcess = spawn(config.python.path, [
      pythonScript,
      city,
      propertyType,
      period
    ]);

    let trendResult = '';
    let errorOutput = '';

    // Collect output from Python script
    pythonProcess.stdout.on('data', (data) => {
      trendResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`, errorOutput);
        return res.status(500).json({
          success: false,
          message: 'Price trend analysis failed',
          error: errorOutput
        });
      }

      try {
        const trends = JSON.parse(trendResult);

        res.status(200).json({
          success: true,
          trends
        });
      } catch (error) {
        console.error('Error parsing trend result:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to parse trend result',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Price trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Price trend analysis failed',
      error: error.message
    });
  }
};

// Get price analysis for a specific property
exports.getPropertyAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    // Find property
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Prepare data for Python script
    const propertyData = {
      propertyId: property._id.toString(),
      propertyType: property.propertyType,
      city: property.city,
      locality: property.location.localityName,
      bedroomNum: property.bedroomNum,
      area: property.minAreaSqft,
      price: property.price,
      pricePerSqft: property.pricePerUnitArea,
      age: property.age || 0
    };

    // Create temporary file with the data
    const tempFile = path.join(__dirname, '../python/temp', `property_analysis_${Date.now()}.json`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempFile);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempFile, JSON.stringify(propertyData));

    // Call Python script
    const pythonScript = path.join(__dirname, '../python/property_analysis.py');
    const pythonProcess = spawn(config.python.path, [pythonScript, tempFile]);

    let analysisResult = '';
    let errorOutput = '';

    // Collect output from Python script
    pythonProcess.stdout.on('data', (data) => {
      analysisResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      if (code !== 0) {
        console.error(`Python process exited with code ${code}`, errorOutput);
        return res.status(500).json({
          success: false,
          message: 'Property analysis failed',
          error: errorOutput
        });
      }

      try {
        const analysis = JSON.parse(analysisResult);

        res.status(200).json({
          success: true,
          property,
          analysis
        });
      } catch (error) {
        console.error('Error parsing analysis result:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to parse analysis result',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Property analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Property analysis failed',
      error: error.message
    });
  }
};