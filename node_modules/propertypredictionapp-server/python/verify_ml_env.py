#!/usr/bin/env python3
"""
Verification script for PropertyPredictor ML environment.
This script checks all the dependencies and directories needed for the price prediction model.
"""

import os
import sys
import importlib
import platform
import traceback

def check_imports():
    """Check if all required libraries are installed"""
    required_packages = [
        'pandas', 
        'numpy', 
        'sklearn', 
        'joblib'
    ]
    
    missing_packages = []
    
    print("\n=== Checking Python Packages ===")
    for package in required_packages:
        try:
            importlib.import_module(package)
            version = importlib.import_module(package).__version__
            print(f"✅ {package} is installed (version {version})")
        except ImportError:
            print(f"❌ {package} is NOT installed")
            missing_packages.append(package)
        except AttributeError:
            print(f"✅ {package} is installed (version unknown)")
    
    return missing_packages

def check_directories():
    """Check if all required directories exist and are writable"""
    # Get base directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define required directories
    required_dirs = [
        os.path.join(base_dir, 'models'),
        os.path.join(base_dir, 'data'),
        os.path.join(base_dir, 'temp')
    ]
    
    print("\n=== Checking Directories ===")
    print(f"Base directory: {base_dir}")
    
    # Check each directory
    for directory in required_dirs:
        # Check if directory exists
        if os.path.exists(directory):
            print(f"✅ Directory exists: {directory}")
        else:
            print(f"❌ Directory does NOT exist: {directory}")
            try:
                os.makedirs(directory)
                print(f"✅ Created directory: {directory}")
            except Exception as e:
                print(f"❌ Failed to create directory: {e}")
                continue
        
        # Check if directory is writable
        try:
            test_file = os.path.join(directory, 'test_write.tmp')
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            print(f"✅ Directory is writable: {directory}")
        except Exception as e:
            print(f"❌ Directory is NOT writable: {directory} - {e}")
    
    return required_dirs

def check_data_file():
    """Check if mumbai.csv exists"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(base_dir, 'data', 'mumbai.csv')
    
    print("\n=== Checking Data File ===")
    if os.path.exists(data_file):
        print(f"✅ Data file exists: {data_file}")
        # Check file size to ensure it's not empty
        size = os.path.getsize(data_file)
        if size > 0:
            print(f"✅ Data file is not empty ({size} bytes)")
        else:
            print(f"❌ Data file is empty ({size} bytes)")
    else:
        print(f"❌ Data file does NOT exist: {data_file}")
        print("ℹ️  The system will fall back to synthetic data generation")

def check_model_file():
    """Check if the model file exists and is valid"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_file = os.path.join(base_dir, 'models', 'price_prediction_model.pkl')
    
    print("\n=== Checking Model File ===")
    if os.path.exists(model_file):
        print(f"✅ Model file exists: {model_file}")
        # Check file size to ensure it's not corrupted
        size = os.path.getsize(model_file)
        if size > 1000:  # Assuming a valid model would be at least 1KB
            print(f"✅ Model file seems valid ({size} bytes)")
        else:
            print(f"⚠️ Model file might be corrupted ({size} bytes)")
    else:
        print(f"❌ Model file does NOT exist: {model_file}")
        print("ℹ️  The model will be created on the first prediction request")

def check_system_info():
    """Print system information for debugging"""
    print("\n=== System Information ===")
    print(f"Python version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"Processor: {platform.processor()}")
    print(f"Architecture: {platform.architecture()[0]}")
    
    # Check available disk space
    try:
        if platform.system() == 'Windows':
            import ctypes
            free_bytes = ctypes.c_ulonglong(0)
            ctypes.windll.kernel32.GetDiskFreeSpaceExW(ctypes.c_wchar_p('.'), None, None, ctypes.pointer(free_bytes))
            print(f"Free disk space: {free_bytes.value / (1024 * 1024 * 1024):.2f} GB")
        else:
            import shutil
            disk_usage = shutil.disk_usage('.')
            print(f"Free disk space: {disk_usage.free / (1024 * 1024 * 1024):.2f} GB")
    except Exception:
        print("Unable to determine free disk space")

def create_sample_data():
    """Create a sample Mumbai CSV file if it doesn't exist"""
    try:
        import pandas as pd
        import numpy as np
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_file = os.path.join(base_dir, 'data', 'mumbai.csv')
        
        # Only create if file doesn't exist
        if os.path.exists(data_file):
            print("\nSample data file already exists, skipping creation.")
            return
        
        print("\n=== Creating Sample Data File ===")
        
        # Property types
        property_types = [
            'Residential Apartment', 
            'Independent House/Villa', 
            'Farm House', 
            'Residential Land', 
            'Studio Apartment', 
            'Independent/Builder Floor'
        ]
        
        # Cities in Mumbai
        cities = [
            'Mumbai Andheri-Dahisar',
            'Central Mumbai suburbs',
            'Mumbai Harbour',
            'Mira Road And Beyond',
            'Mumbai Beyond Thane',
            'Mumbai South West',
            'Navi Mumbai',
            'South Mumbai',
            'Thane'
        ]
        
        # Localities
        localities = [
            'Andheri West', 'Andheri East', 'Powai', 'Bandra West', 'Borivali West',
            'Thane West', 'Kharghar', 'Malad West', 'Goregaon East', 'Kandivali West',
            'Chembur', 'Worli', 'Parel', 'Juhu', 'Bhandup West'
        ]
        
        # Create sample data
        n_samples = 1000
        
        data = {
            'PROPERTY_TYPE': np.random.choice(property_types, n_samples, p=[0.5, 0.2, 0.05, 0.1, 0.1, 0.05]),
            'CITY': np.random.choice(cities, n_samples),
            'location.LOCALITY_NAME': np.random.choice(localities, n_samples),
            'BEDROOM_NUM': np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.1, 0.4, 0.3, 0.15, 0.05]),
            'FURNISH': np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.2, 0.2]),  # 0=Unfurnished, 1=Furnished, 2=Semi
            'MIN_AREA_SQFT': np.random.uniform(400, 2000, n_samples),
            'MAX_AREA_SQFT': None,  # Will calculate below
            'PRICE_PER_UNIT_AREA': np.random.uniform(8000, 25000, n_samples),
            'AGE': np.random.randint(0, 15, n_samples),
            'TOTAL_FLOOR': np.random.randint(1, 25, n_samples),
            'FLOOR_NUM': None,  # Will calculate below
        }
        
        # Calculate dependent fields
        df = pd.DataFrame(data)
        df['MAX_AREA_SQFT'] = df['MIN_AREA_SQFT'] * (1 + np.random.uniform(0, 0.1, n_samples))
        df['FLOOR_NUM'] = df.apply(lambda row: np.random.randint(1, row['TOTAL_FLOOR'] + 1), axis=1)
        df['PRICE'] = df['MIN_AREA_SQFT'] * df['PRICE_PER_UNIT_AREA']
        
        # Save to CSV
        df.to_csv(data_file, index=False)
        print(f"✅ Created sample data file with {n_samples} records: {data_file}")
        
    except Exception as e:
        print(f"❌ Failed to create sample data: {e}")
        traceback.print_exc()

def main():
    """Main function to run all checks"""
    print("====================================")
    print("PropertyPredictor ML System Verifier")
    print("====================================")
    
    # Check Python packages
    missing_packages = check_imports()
    
    # Check directories
    check_directories()
    
    # Check data file
    check_data_file()
    
    # Check model file
    check_model_file()
    
    # Check system info
    check_system_info()
    
    # Create sample data if option provided
    if '--create-sample-data' in sys.argv:
        create_sample_data()
    
    # Print summary
    print("\n=== Summary ===")
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("   Please install them with:")
        print(f"   pip install {' '.join(missing_packages)}")
    else:
        print("✅ All required packages are installed")
    
    print("\nTo create the model manually, run the following Python code:")
    print("""
from price_prediction import load_or_train_model
model_data = load_or_train_model()
print("Model loaded/created successfully")
    """)
    
    print("\nAdd the --create-sample-data flag to generate synthetic Mumbai property data")

if __name__ == "__main__":
    main()