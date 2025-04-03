// server/scripts/insertSampleData.js
const mongoose = require('mongoose');
const config = require('../config/config');

// Define the Property schema directly in this script
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

// Create the Property model
const Property = mongoose.model('Property', propertySchema);

// Sample property data
const sampleProperties = [
  {
    propId: "PROP001",
    propHeading: "Modern 2 BHK Apartment in Andheri West",
    description: "A beautiful, well-maintained 2 BHK apartment with modern amenities located in the heart of Andheri West.",
    propertyType: "Residential Apartment",
    city: "Mumbai Andheri-Dahisar",
    location: {
      localityName: "Andheri West",
      buildingName: "Horizon Heights",
      societyName: "Horizon Society",
      address: "Andheri West, Mumbai"
    },
    mapDetails: {
      latitude: "19.1307",
      longitude: "72.8352"
    },
    bedroomNum: 2,
    price: 9500000,
    pricePerUnitArea: 15833,
    minAreaSqft: 600,
    maxAreaSqft: 600,
    furnishStatus: 1, // Furnished
    facing: 3, // East
    age: 2,
    totalFloor: 15,
    floorNum: 8,
    balconyNum: 1,
    amenities: "1,12,21,23,24",
    features: "1,6",
    isPremium: true,
    tags: ["premium", "furnished", "metro"]
  },
  {
    propId: "PROP002",
    propHeading: "Spacious 3 BHK Villa in Thane",
    description: "Luxurious 3 BHK villa with garden and parking space in a gated community in Thane.",
    propertyType: "Independent House/Villa",
    city: "Thane",
    location: {
      localityName: "Thane West",
      societyName: "Green Valley",
      address: "Thane West, Mumbai"
    },
    mapDetails: {
      latitude: "19.2183",
      longitude: "72.9780"
    },
    bedroomNum: 3,
    price: 18500000,
    pricePerUnitArea: 18500,
    minAreaSqft: 1000,
    maxAreaSqft: 1000,
    furnishStatus: 2, // Semi-Furnished
    facing: 2, // South
    age: 1,
    totalFloor: 2,
    floorNum: 1,
    balconyNum: 2,
    amenities: "1,12,19,21,23,32",
    features: "1,17,19",
    isPremium: true,
    tags: ["premium", "garden", "villa"]
  },
  {
    propId: "PROP003",
    propHeading: "Budget 1 BHK in Mira Road",
    description: "Affordable 1 BHK apartment perfect for first-time homebuyers or investors.",
    propertyType: "Residential Apartment",
    city: "Mira Road And Beyond",
    location: {
      localityName: "Mira Road",
      buildingName: "Sunrise Apartments",
      societyName: "Sunrise CHS",
      address: "Mira Road East, Mumbai"
    },
    mapDetails: {
      latitude: "19.2813",
      longitude: "72.8724"
    },
    bedroomNum: 1,
    price: 4500000,
    pricePerUnitArea: 11250,
    minAreaSqft: 400,
    maxAreaSqft: 400,
    furnishStatus: 0, // Unfurnished
    facing: 1, // North
    age: 5,
    totalFloor: 7,
    floorNum: 3,
    balconyNum: 1,
    amenities: "21,24",
    features: "8,9",
    isPremium: false,
    tags: ["budget", "starter home"]
  },
  {
    propId: "PROP004",
    propHeading: "Premium 4 BHK Apartment in Powai",
    description: "Luxurious 4 BHK apartment with lake view and premium amenities in upscale Powai.",
    propertyType: "Residential Apartment",
    city: "Central Mumbai suburbs",
    location: {
      localityName: "Powai",
      buildingName: "Lakeside Towers",
      societyName: "Lakeside CHS",
      address: "Powai, Mumbai"
    },
    mapDetails: {
      latitude: "19.1204",
      longitude: "72.9060"
    },
    bedroomNum: 4,
    price: 32500000,
    pricePerUnitArea: 27083,
    minAreaSqft: 1200,
    maxAreaSqft: 1200,
    furnishStatus: 1, // Furnished
    facing: 5, // North-East
    age: 0,
    totalFloor: 25,
    floorNum: 18,
    balconyNum: 3,
    amenities: "1,12,17,19,21,23,24,25,26,29,45,46,47",
    features: "6,17,19",
    isPremium: true,
    tags: ["premium", "lake view", "luxury"]
  },
  {
    propId: "PROP005",
    propHeading: "Studio Apartment in Kharghar",
    description: "Modern studio apartment with all amenities in the heart of Kharghar, perfect for singles or young couples.",
    propertyType: "Studio Apartment",
    city: "Navi Mumbai",
    location: {
      localityName: "Kharghar",
      buildingName: "Metro Residency",
      societyName: "Metro CHS",
      address: "Sector 10, Kharghar, Navi Mumbai"
    },
    mapDetails: {
      latitude: "19.0370",
      longitude: "73.0583"
    },
    bedroomNum: 1,
    price: 3800000,
    pricePerUnitArea: 12667,
    minAreaSqft: 300,
    maxAreaSqft: 300,
    furnishStatus: 1, // Furnished
    facing: 4, // West
    age: 3,
    totalFloor: 12,
    floorNum: 9,
    balconyNum: 1,
    amenities: "1,21,23,24,45",
    features: "8",
    isPremium: false,
    tags: ["studio", "metro", "modern"]
  }
];

// Main function to insert data
async function insertSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing properties (optional - comment out if you don't want to delete existing data)
    await Property.deleteMany({});
    console.log('Cleared existing properties');
    
    // Insert sample properties
    const inserted = await Property.insertMany(sampleProperties);
    
    console.log(`Successfully inserted ${inserted.length} sample properties`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Execute the function
insertSampleData();