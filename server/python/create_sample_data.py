# import pandas as pd
# import numpy as np
# import os

# def create_sample_csv():
#     """Create a sample Mumbai CSV file with the correct column structure"""
#     # Create sample data
#     n_samples = 1000
    
#     # Property types
#     property_types = [
#         'Residential Apartment', 
#         'Independent House/Villa', 
#         'Farm House', 
#         'Residential Land', 
#         'Studio Apartment'
#     ]
    
#     # Cities
#     cities = [
#         'Mumbai Andheri-Dahisar',
#         'Central Mumbai suburbs',
#         'Navi Mumbai',
#         'South Mumbai',
#         'Thane'
#     ]
    
#     # Localities
#     localities = [
#         'Andheri West', 'Bandra West', 'Powai', 'Goregaon East', 
#         'Malad West', 'Kandivali West', 'Borivali West', 'Thane West',
#         'Kharghar', 'Vashi', 'Worli', 'Juhu'
#     ]
    
#     # Generate data
#     data = {
#         'PROPERTY_TYPE': np.random.choice(property_types, n_samples),
#         'CITY': np.random.choice(cities, n_samples),
#         'LOCALITY_NAME': np.random.choice(localities, n_samples),
#         'BEDROOM_NUM': np.random.choice([1, 2, 3, 4, 5], n_samples),
#         'FURNISH': np.random.choice([0, 1, 2], n_samples),
#         'MIN_AREA_SQFT': np.random.uniform(400, 2000, n_samples),
#         'PRICE_PER_UNIT_AREA': np.random.uniform(8000, 25000, n_samples)
#     }
    
#     # Create DataFrame
#     df = pd.DataFrame(data)
    
#     # Add derived columns
#     df['MAX_AREA_SQFT'] = df['MIN_AREA_SQFT'] * (1 + np.random.uniform(0, 0.1, n_samples))
#     df['PRICE'] = df['MIN_AREA_SQFT'] * df['PRICE_PER_UNIT_AREA']
#     df['AGE'] = np.random.randint(0, 15, n_samples)
    
#     # Ensure the data directory exists
#     data_dir = os.path.join(os.path.dirname(__file__), 'data')
#     if not os.path.exists(data_dir):
#         os.makedirs(data_dir)
    
#     # Save to CSV
#     csv_path = os.path.join(data_dir, 'mumbai.csv')
#     df.to_csv(csv_path, index=False)
    
#     print(f"Created sample Mumbai CSV file with {n_samples} records at: {csv_path}")
#     print(f"Columns: {list(df.columns)}")
    
#     return csv_path

# if __name__ == "__main__":
#     create_sample_csv()

def create_sample_dataset():
    """Create a sample dataset based on our analysis"""
    # This is a fallback in case the CSV file is not accessible
    data = {
        'PROPERTY_TYPE': ['Residential Apartment'] * 100 + ['Independent House/Villa'] * 50,
        'CITY': ['Mumbai Andheri-Dahisar'] * 50 + ['Thane'] * 50 + ['Navi Mumbai'] * 50,
        'location.LOCALITY_NAME': ['Andheri West'] * 30 + ['Thane West'] * 30 + ['Kharghar'] * 30 + 
                               ['Goregaon East'] * 30 + ['Powai'] * 30,
        'BEDROOM_NUM': [1] * 40 + [2] * 50 + [3] * 40 + [4] * 20,
        'FURNISH': [0] * 70 + [1] * 80,
        'MIN_AREA_SQFT': np.random.uniform(400, 2000, 150),
        'PRICE_PER_UNIT_AREA': np.random.uniform(10000, 30000, 150),
        'AGE': np.random.randint(0, 10, 150)
    }
    
    # Calculate price based on the features
    df = pd.DataFrame(data)
    df['PRICE'] = df['MIN_AREA_SQFT'] * df['PRICE_PER_UNIT_AREA']
    
    # Print column names for debugging
    print(f"Sample dataset columns: {list(df.columns)}")
    
    return df