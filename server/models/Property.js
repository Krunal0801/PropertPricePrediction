const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  propId: {
    type: String,
    required: true,
    unique: true
  },
  propHeading: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['Residential Apartment', 'Independent House/Villa', 'Farm House', 'Residential Land', 'Studio Apartment', 'Independent/Builder Floor', 'Serviced Apartments']
  },
  city: {
    type: String,
    required: true
  },
  location: {
    type: Object,
    required: true,
    properties: {
      cityName: String,
      localityName: String,
      buildingName: String,
      societyName: String,
      address: String
    }
  },
  mapDetails: {
    type: Object,
    required: true,
    properties: {
      latitude: String,
      longitude: String
    }
  },
  bedroomNum: {
    type: Number,
    default: null
  },
  price: {
    type: Number,
    required: true
  },
  pricePerUnitArea: {
    type: Number,
    required: true
  },
  minAreaSqft: {
    type: Number,
    required: true
  },
  maxAreaSqft: {
    type: Number,
    required: true
  },
  furnishStatus: {
    type: Number,
    enum: [0, 1, 2], // 0: Unfurnished, 1: Furnished, 2: Semi-Furnished
    default: 0
  },
  facing: {
    type: Number,
    default: 0
  },
  age: {
    type: Number,
    default: 0
  },
  totalFloor: {
    type: Number,
    default: 0
  },
  floorNum: {
    type: Number,
    default: null
  },
  balconyNum: {
    type: Number,
    default: 0
  },
  amenities: {
    type: String,
    default: null
  },
  features: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  landmarks: {
    type: Object,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index fields for faster searches
propertySchema.index({ propertyType: 1, city: 1 });
propertySchema.index({ 'location.localityName': 1 });
propertySchema.index({ bedroomNum: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ minAreaSqft: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;