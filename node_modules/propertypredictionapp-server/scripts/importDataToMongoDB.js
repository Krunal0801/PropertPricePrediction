// server/scripts/importDataToMongoDB.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { spawn } = require('child_process');
const config = require('../config/config');
const Property = require('../models/Property');

// Configuration
const CSV_PATH = path.join(__dirname, '..', 'python', 'data', 'mumbai.csv');
// const PKL_PATH = path.join(__dirname, '..', 'python', 'models', 'mumbai_data.pkl');
const PKL_PATH="../pthon/models/mumbai_data.pkl";
const PYTHON_PATH = config.python.path || 'python';
const TEMP_JSON_PATH = path.join(__dirname, 'temp_data.json');

// Main function to import data
async function importData() {
  try {
    // Connect to MongoDB
    // await mongoose.connect(config.mongodb.uri || process.env.MONGODB_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true
    // });
      await mongoose.connect("mongodb://127.0.0.1:27017/propertypriceprediction", {
       useNewUrlParser: true,
       useUnifiedTopology: true
     });
    console.log('Connected to MongoDB');
    
    // Check if there are existing properties
    const existingCount = await Property.countDocuments();
    console.log(`Existing properties count: ${existingCount}`);
    
    // Ask user if they want to continue if properties already exist
    if (existingCount > 0) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Database already has properties. Continue? (Y/N): ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          await processImport();
          readline.close();
        } else {
          console.log('Operation cancelled.');
          readline.close();
          await mongoose.disconnect();
        }
      });
    } else {
      await processImport();
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Function to process the import based on available files
async function processImport() {
  try {
    // Check which files exist
    const csvExists = fs.existsSync(CSV_PATH);
    const pklExists = fs.existsSync(PKL_PATH);
    
    console.log(`CSV file exists: ${csvExists}`);
    console.log(`PKL file exists: ${pklExists}`);
    
    if (csvExists) {
      console.log('Importing from CSV file...');
      await importFromCSV();
    } else if (pklExists) {
      console.log('Importing from PKL file...');
      await importFromPKL();
    } else {
      console.log('No data files found. Please run verify_ml_env.py --create-sample-data to generate sample data.');
      await generateSampleData();
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error during import:', error);
    await mongoose.disconnect();
  }
}

// Function to import data from CSV
async function importFromCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Read ${results.length} records from CSV`);
        
        try {
          // Transform CSV data to match Property schema
          const properties = results.map((row, index) => {
            // Create a unique property ID
            const propId = `PROP${String(index + 1).padStart(4, '0')}`;
            
            // Map CSV columns to Property schema
            return {
              propId,
              propHeading: `${row.BEDROOM_NUM || 2} BHK ${row.PROPERTY_TYPE || 'Residential Apartment'} in ${row['location.LOCALITY_NAME'] || row.LOCALITY_NAME || 'Mumbai'}`,
              description: `Beautiful property located in ${row['location.LOCALITY_NAME'] || row.LOCALITY_NAME || 'Mumbai'} with modern amenities.`,
              propertyType: row.PROPERTY_TYPE || 'Residential Apartment',
              city: row.CITY || 'Mumbai',
              location: {
                localityName: row['location.LOCALITY_NAME'] || row.LOCALITY_NAME || 'Unknown',
                buildingName: `Building ${index + 1}`,
                societyName: `Society ${index + 1}`,
                address: `${row['location.LOCALITY_NAME'] || row.LOCALITY_NAME || 'Unknown'}, ${row.CITY || 'Mumbai'}`
              },
              mapDetails: {
                latitude: "19.0760" + Math.random().toString().slice(2, 6),
                longitude: "72.8777" + Math.random().toString().slice(2, 6)
              },
              bedroomNum: parseInt(row.BEDROOM_NUM) || 2,
              price: parseFloat(row.PRICE) || (parseFloat(row.MIN_AREA_SQFT || 1000) * parseFloat(row.PRICE_PER_UNIT_AREA || 15000)),
              pricePerUnitArea: parseFloat(row.PRICE_PER_UNIT_AREA) || 15000,
              minAreaSqft: parseFloat(row.MIN_AREA_SQFT) || 1000,
              maxAreaSqft: parseFloat(row.MAX_AREA_SQFT) || parseFloat(row.MIN_AREA_SQFT) || 1000,
              furnishStatus: parseInt(row.FURNISH) || 0,
              facing: Math.floor(Math.random() * 8) + 1, // Random facing 1-8
              age: parseInt(row.AGE) || 0,
              totalFloor: Math.floor(Math.random() * 20) + 1, // Random total floors 1-20
              floorNum: Math.floor(Math.random() * 10) + 1, // Random floor number 1-10
              balconyNum: Math.floor(Math.random() * 3) + 1, // Random balconies 1-3
              amenities: "1,21,23,24", // Basic amenities
              features: "1,6", // Basic features
              isPremium: Math.random() > 0.7, // 30% premium properties
              tags: ["modern", "well-connected"]
            };
          });
          
          // Insert properties into MongoDB
          const inserted = await Property.insertMany(properties);
          console.log(`Successfully inserted ${inserted.length} properties from CSV`);
          resolve();
        } catch (error) {
          console.error('Error transforming or inserting CSV data:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Function to import data from PKL using Python
async function importFromPKL() {
  return new Promise((resolve, reject) => {
    // Create Python script to convert PKL to JSON
    const pythonCode = `
import sys
import json
import pickle
import pandas as pd
import numpy as np

# Load the pickle file
pickle_path = "${PKL_PATH.replace(/\\/g, '/')}"
output_path = "${TEMP_JSON_PATH.replace(/\\/g, '/')}"

try:
    # Try to load as a DataFrame
    try:
        df = pd.read_pickle(pickle_path)
        data = df.to_dict(orient='records')
    except:
        # Try to load as a raw pickle file
        with open(pickle_path, 'rb') as f:
            data = pickle.load(f)
            
            # If data is not a list, convert it
            if not isinstance(data, list):
                if isinstance(data, dict):
                    data = [data]
                else:
                    data = [{"data": str(data)}]
    
    # Save to JSON
    with open(output_path, 'w') as f:
        json.dump(data, f)
        
    print(f"Successfully converted pickle to JSON with {len(data)} records")
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

    // Create temporary Python script
    const tempPyFile = path.join(__dirname, 'temp_converter.py');
    fs.writeFileSync(tempPyFile, pythonCode);
    
    // Execute Python script
    const pythonProcess = spawn(PYTHON_PATH, [tempPyFile]);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    pythonProcess.on('close', async (code) => {
      try {
        // Clean up temporary Python script
        if (fs.existsSync(tempPyFile)) {
          fs.unlinkSync(tempPyFile);
        }
        
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error('Error output:', stderrData);
          throw new Error('Failed to convert pickle file');
        }
        
        console.log('Python output:', stdoutData);
        
        // Check if JSON file was created
        if (!fs.existsSync(TEMP_JSON_PATH)) {
          throw new Error('JSON file was not created');
        }
        
        // Read JSON data
        const jsonData = JSON.parse(fs.readFileSync(TEMP_JSON_PATH, 'utf8'));
        console.log(`Read ${jsonData.length} records from JSON`);
        
        // Transform data to match Property schema
        const properties = jsonData.map((row, index) => {
          // Create a unique property ID
          const propId = `PROP${String(index + 1).padStart(4, '0')}`;
          
          // Extract property type, city, locality
          const propertyType = row.PROPERTY_TYPE || row.propertyType || 'Residential Apartment';
          const city = row.CITY || row.city || 'Mumbai';
          const locality = row['location.LOCALITY_NAME'] || row.LOCALITY_NAME || row.locality || 'Unknown';
          
          return {
            propId,
            propHeading: `${row.BEDROOM_NUM || row.bedroomNum || 2} BHK ${propertyType} in ${locality}`,
            description: `Beautiful property located in ${locality} with modern amenities.`,
            propertyType,
            city,
            location: {
              localityName: locality,
              buildingName: `Building ${index + 1}`,
              societyName: `Society ${index + 1}`,
              address: `${locality}, ${city}`
            },
            mapDetails: {
              latitude: "19.0760" + Math.random().toString().slice(2, 6),
              longitude: "72.8777" + Math.random().toString().slice(2, 6)
            },
            bedroomNum: parseInt(row.BEDROOM_NUM || row.bedroomNum) || 2,
            price: parseFloat(row.PRICE || row.price) || (parseFloat(row.MIN_AREA_SQFT || row.area || 1000) * parseFloat(row.PRICE_PER_UNIT_AREA || row.pricePerSqft || 15000)),
            pricePerUnitArea: parseFloat(row.PRICE_PER_UNIT_AREA || row.pricePerSqft) || 15000,
            minAreaSqft: parseFloat(row.MIN_AREA_SQFT || row.area) || 1000,
            maxAreaSqft: parseFloat(row.MAX_AREA_SQFT || row.area) || parseFloat(row.MIN_AREA_SQFT || row.area) || 1000,
            furnishStatus: parseInt(row.FURNISH || row.furnishStatus) || 0,
            facing: Math.floor(Math.random() * 8) + 1, // Random facing 1-8
            age: parseInt(row.AGE || row.age) || 0,
            totalFloor: Math.floor(Math.random() * 20) + 1, // Random total floors 1-20
            floorNum: Math.floor(Math.random() * 10) + 1, // Random floor number 1-10
            balconyNum: Math.floor(Math.random() * 3) + 1, // Random balconies 1-3
            amenities: "1,21,23,24", // Basic amenities
            features: "1,6", // Basic features
            isPremium: Math.random() > 0.7, // 30% premium properties
            tags: ["modern", "well-connected"]
          };
        });
        
        // Insert properties into MongoDB
        const inserted = await Property.insertMany(properties);
        console.log(`Successfully inserted ${inserted.length} properties from PKL`);
        
        // Clean up temporary JSON file
        if (fs.existsSync(TEMP_JSON_PATH)) {
          fs.unlinkSync(TEMP_JSON_PATH);
        }
        
        resolve();
      } catch (error) {
        console.error('Error processing PKL data:', error);
        reject(error);
      }
    });
  });
}

// Function to generate sample data using the Python script
async function generateSampleData() {
  return new Promise((resolve, reject) => {
    console.log('Generating sample data using Python script...');
    
    const pythonScript = path.join(__dirname, '..', 'python', 'verify_ml_env.py');
    const pythonProcess = spawn(PYTHON_PATH, [pythonScript, '--create-sample-data']);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
      console.log(data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      console.error(data.toString());
    });
    
    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error('Error output:', stderrData);
        reject(new Error('Failed to generate sample data'));
        return;
      }
      
      console.log('Sample data generated successfully');
      
      // Now try importing from CSV again since it should be created
      if (fs.existsSync(CSV_PATH)) {
        try {
          await importFromCSV();
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        console.log('Sample data was generated but CSV file was not found at', CSV_PATH);
        reject(new Error('CSV file not found after sample data generation'));
      }
    });
  });
}

// Execute the function
importData();