const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferredLocations: [{
    type: String
  }],
  preferredPropertyTypes: [{
    type: String
  }],
  preferredBedrooms: [{
    type: Number
  }],
  priceRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100000000
    }
  },
  areaRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 10000
    }
  },
  preferredAmenities: [{
    type: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

module.exports = UserPreference;