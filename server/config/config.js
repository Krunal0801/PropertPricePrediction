require('dotenv').config();
module.exports = {
    jwt: {
      secret: process.env.JWT_SECRET || 'm5TH7j9pL2qR8sD3vF6wX4zC7bN2mK5p',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/propertypriceprediction'
    },
    sms: {
      apiKey: process.env.SMS_API_KEY,
      apiSecret: process.env.SMS_API_SECRET,
      from: process.env.SMS_FROM
    },
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY
    },
    python: {
      path: process.env.PYTHON_PATH || 'python3'
    },
    upload: {
      profilePicturePath: 'uploads/profile-pictures',
      propertyImagesPath: 'uploads/property-images'
    }
  };
  