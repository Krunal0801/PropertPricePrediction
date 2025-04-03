/**
 * Debug Script for Python Process Execution
 * 
 * This script helps diagnose issues with Python script execution
 * from Node.js by providing detailed logging of the spawn process.
 * 
 * Usage:
 * 1. Save this file as debug-python.js in your project root
 * 2. Run with: node debug-python.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  pythonPath: process.env.PYTHON_PATH || 'python',
  // scriptPath: path.join(__dirname, 'server/python/price_prediction.py'),
  scriptPath: path.join(__dirname, 'server/python/new_price_prediction.py'),
  inputData: {
    propertyType: 'Residential Apartment',
    city: 'Mumbai Andheri-Dahisar',
    locality: 'Andheri West',
    bedroomNum: 2,
    furnishStatus: 0,
    area: 1000,
    years: 5
  }
};

// Create directories if they don't exist
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, 'server/python/models'),
    path.join(__dirname, 'server/python/temp'),
    path.join(__dirname, 'server/python/data')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.log(`Directory exists: ${dir}`);
    }
  });
};

// Create temp file with input data
const createTempFile = (data) => {
  const tempDir = path.join(__dirname, 'server/python/temp');
  const tempFile = path.join(tempDir, `debug_data_${Date.now()}.json`);
  
  fs.writeFileSync(tempFile, JSON.stringify(data));
  console.log(`Created temp file: ${tempFile}`);
  
  return tempFile;
};

// Execute Python script
const runPythonScript = (scriptPath, inputFile) => {
  console.log(`\nExecuting Python script: ${scriptPath}`);
  console.log(`Python executable: ${config.pythonPath}`);
  console.log(`Input file: ${inputFile}`);
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const pythonProcess = spawn(config.pythonPath, [scriptPath, inputFile]);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutData += output;
      console.log(`\n[PYTHON STDOUT]:\n${output}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderrData += output;
      console.error(`\n[PYTHON STDERR]:\n${output}`);
    });
    
    pythonProcess.on('close', (code) => {
      const endTime = Date.now();
      const executionTime = (endTime - startTime) / 1000;
      
      console.log(`\n[PROCESS] Python process exited with code ${code}`);
      console.log(`[PROCESS] Execution time: ${executionTime.toFixed(2)} seconds`);
      
      if (code === 0) {
        try {
          // Try to parse stdout as JSON (assuming prediction result)
          const result = JSON.parse(stdoutData);
          console.log('\n[RESULT] Successfully parsed prediction result:');
          console.log(JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          console.log('\n[RESULT] Could not parse output as JSON:');
          console.log(stdoutData);
          resolve({ raw: stdoutData });
        }
      } else {
        console.error(`\n[ERROR] Python process failed with code ${code}`);
        reject(new Error(`Python process exited with code ${code}: ${stderrData}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error(`\n[ERROR] Failed to start Python process: ${error.message}`);
      reject(error);
    });
  });
};

// Check if model file exists
const checkModelFile = () => {
  const modelPath = path.join(__dirname, 'server/python/models/price_prediction_model.pkl');
  
  if (fs.existsSync(modelPath)) {
    const stats = fs.statSync(modelPath);
    console.log(`\n[INFO] Model file exists: ${modelPath}`);
    console.log(`[INFO] Model file size: ${stats.size} bytes`);
    console.log(`[INFO] Last modified: ${stats.mtime}`);
  } else {
    console.log(`\n[INFO] Model file does not exist: ${modelPath}`);
    console.log('[INFO] A new model will be created during execution');
  }
};

// Check Python version
const checkPythonVersion = () => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(config.pythonPath, ['-V']);
    
    pythonProcess.stdout.on('data', (data) => {
      console.log(`\n[INFO] ${data.toString().trim()}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.log(`\n[INFO] ${data.toString().trim()}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Check for required packages
        checkPythonPackages().then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to get Python version. Is Python installed?`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to run Python: ${error.message}`));
    });
  });
};

// Check required Python packages
const checkPythonPackages = () => {
  const packagesScript = `
import sys
try:
    import pandas
    print("pandas: " + pandas.__version__)
except ImportError:
    print("pandas: NOT INSTALLED")

try:
    import numpy
    print("numpy: " + numpy.__version__)
except ImportError:
    print("numpy: NOT INSTALLED")

try:
    import sklearn
    print("scikit-learn: " + sklearn.__version__)
except ImportError:
    print("scikit-learn: NOT INSTALLED")

try:
    import joblib
    print("joblib: " + joblib.__version__)
except ImportError:
    print("joblib: NOT INSTALLED")
`;

  return new Promise((resolve, reject) => {
    console.log('\n[INFO] Checking Python packages...');
    
    const pythonProcess = spawn(config.pythonPath, ['-c', packagesScript]);
    
    pythonProcess.stdout.on('data', (data) => {
      console.log(`[INFO] ${data.toString().trim()}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`[ERROR] ${data.toString().trim()}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Failed to check Python packages'));
      }
    });
  });
};

// Main function
const main = async () => {
  console.log('=============================================');
  console.log('Python Process Debugger for Price Prediction');
  console.log('=============================================');
  
  try {
    // Check Python installation
    await checkPythonVersion();
    
    // Ensure directories exist
    ensureDirectories();
    
    // Check if model file exists
    checkModelFile();
    
    // Create temp input file
    const tempFile = createTempFile(config.inputData);
    
    // Run Python script
    console.log('\n[INFO] Running price prediction script...');
    const result = await runPythonScript(config.scriptPath, tempFile);
    
    // Clean up
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      console.log(`\n[INFO] Cleaned up temp file: ${tempFile}`);
    }
    
    // Check model file again
    checkModelFile();
    
    console.log('\n[SUCCESS] Process completed successfully');
  } catch (error) {
    console.error(`\n[FATAL ERROR] ${error.message}`);
    process.exit(1);
  }
};

// Run the main function
main();