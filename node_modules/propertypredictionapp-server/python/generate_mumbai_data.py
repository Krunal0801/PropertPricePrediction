#!/usr/bin/env python3
# server/python/generate_mumbai_data.py

import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

def generate_mumbai_property_data(num_records=100):
    """
    Generate a realistic dataset of Mumbai properties with all the necessary fields
    for the PropertyPredictor application.
    """
    print(f"Generating {num_records} Mumbai property records...")
    
    # Property types with their probabilities
    property_types = [
        'Residential Apartment', 
        'Independent House/Villa', 
        'Farm House', 
        'Residential Land', 
        'Studio Apartment',
        'Independent/Builder Floor',
        'Serviced Apartments'
    ]
    property_type_probs = [0.6, 0.15, 0.05, 0.05, 0.05, 0.05, 0.05]
    
    # Cities in Mumbai with their probabilities
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
    city_probs = [0.25, 0.15, 0.05, 0.1, 0.05, 0.1, 0.1, 0.1, 0.1]
    
    # Localities by city
    localities_by_city = {
        'Mumbai Andheri-Dahisar': ['Andheri West', 'Andheri East', 'Borivali West', 'Malad West', 'Goregaon East', 
                               'Kandivali West', 'Jogeshwari West', 'Dahisar East'],
        'Central Mumbai suburbs': ['Powai', 'Bhandup West', 'Mulund West', 'Kanjurmarg', 'Vikhroli'],
        'Mumbai Harbour': ['Chembur', 'Wadala', 'Sewri', 'Cotton Green', 'Reay Road'],
        'Mira Road And Beyond': ['Mira Road', 'Bhayander East', 'Bhayander West', 'Naigaon', 'Vasai'],
        'Mumbai Beyond Thane': ['Ambernath', 'Dombivli', 'Kalyan', 'Ulhasnagar', 'Badlapur'],
        'Mumbai South West': ['Bandra West', 'Santacruz West', 'Khar West', 'Juhu', 'Vile Parle West'],
        'Navi Mumbai': ['Kharghar', 'Vashi', 'Nerul', 'Panvel', 'Airoli', 'Belapur'],
        'South Mumbai': ['Worli', 'Prabhadevi', 'Dadar West', 'Matunga', 'Parel', 'Colaba', 'Fort'],
        'Thane': ['Thane West', 'Thane East', 'Majiwada', 'Manpada', 'Ghodbunder Road']
    }
    
    # Bedroom distribution by property type
    bedroom_probs = {
        'Residential Apartment': [0.1, 0.4, 0.3, 0.15, 0.05],  # 1-5 BHK
        'Independent House/Villa': [0.05, 0.15, 0.4, 0.3, 0.1],
        'Farm House': [0, 0.1, 0.3, 0.4, 0.2],
        'Residential Land': [0.2, 0.2, 0.2, 0.2, 0.2],  # N/A for land, but keeping for consistency
        'Studio Apartment': [1, 0, 0, 0, 0],  # Always 1 BHK
        'Independent/Builder Floor': [0.1, 0.3, 0.4, 0.15, 0.05],
        'Serviced Apartments': [0.3, 0.5, 0.2, 0, 0]
    }
    
    # Price range by city (in lakhs)
    min_price_by_city = {
        'Mumbai Andheri-Dahisar': 80,
        'Central Mumbai suburbs': 100,
        'Mumbai Harbour': 90,
        'Mira Road And Beyond': 45,
        'Mumbai Beyond Thane': 35,
        'Mumbai South West': 150,
        'Navi Mumbai': 50,
        'South Mumbai': 200,
        'Thane': 60
    }
    
    max_price_by_city = {
        'Mumbai Andheri-Dahisar': 300,
        'Central Mumbai suburbs': 400,
        'Mumbai Harbour': 350,
        'Mira Road And Beyond': 120,
        'Mumbai Beyond Thane': 100,
        'Mumbai South West': 800,
        'Navi Mumbai': 200,
        'South Mumbai': 2000,
        'Thane': 200
    }
    
    # Area range by bedroom count (in sq.ft.)
    min_area_by_bedroom = {
        1: 300,
        2: 550,
        3: 850,
        4: 1200,
        5: 1800
    }
    
    max_area_by_bedroom = {
        1: 650,
        2: 950,
        3: 1400,
        4: 2200,
        5: 4000
    }
    
    # Price per sq.ft. by city
    price_per_sqft_by_city = {
        'Mumbai Andheri-Dahisar': (13000, 25000),
        'Central Mumbai suburbs': (15000, 30000),
        'Mumbai Harbour': (14000, 28000),
        'Mira Road And Beyond': (8000, 15000),
        'Mumbai Beyond Thane': (6000, 12000),
        'Mumbai South West': (20000, 45000),
        'Navi Mumbai': (8000, 18000),
        'South Mumbai': (30000, 100000),
        'Thane': (10000, 20000)
    }
    
    # Create empty lists for all data
    data = {
        'PROPERTY_TYPE': [],
        'CITY': [],
        'LOCALITY_NAME': [],
        'BEDROOM_NUM': [],
        'FURNISH': [],
        'MIN_AREA_SQFT': [],
        'MAX_AREA_SQFT': [],
        'PRICE_PER_UNIT_AREA': [],
        'PRICE': [],
        'AGE': [],
        'TOTAL_FLOOR': [],
        'FLOOR_NUM': [],
        'BALCONY_NUM': [],
        'FACING': [],
        'PROP_ID': [],
        'AMENITIES': [],
        'FEATURES': [],
        'IS_PREMIUM': []
    }
    
    # Generate random properties
    for i in range(num_records):
        # Select property type
        property_type = np.random.choice(property_types, p=property_type_probs)
        
        # Select city
        city = np.random.choice(cities, p=city_probs)
        
        # Select locality based on city
        locality = np.random.choice(localities_by_city[city])
        
        # Select bedroom count based on property type
        bedroom_num = np.random.choice([1, 2, 3, 4, 5], p=bedroom_probs[property_type])
        
        # Determine area based on bedroom count
        min_area = min_area_by_bedroom[bedroom_num]
        max_area = max_area_by_bedroom[bedroom_num]
        area = np.random.randint(min_area, max_area)
        
        # Determine price per sq.ft. based on city
        min_price_per_sqft, max_price_per_sqft = price_per_sqft_by_city[city]
        price_per_sqft = np.random.randint(min_price_per_sqft, max_price_per_sqft)
        
        # Calculate price
        price = area * price_per_sqft
        
        # Furnish status (0: Unfurnished, 1: Furnished, 2: Semi-Furnished)
        furnish_status = np.random.choice([0, 1, 2], p=[0.5, 0.2, 0.3])
        
        # Property age (in years)
        age = np.random.choice([0, 1, 2, 3, 4, 5, 7, 10, 15, 20], p=[0.2, 0.15, 0.15, 0.1, 0.1, 0.1, 0.05, 0.05, 0.05, 0.05])
        
        # Total floors in building
        total_floor = np.random.randint(1, 30)
        
        # Floor number of property
        floor_num = min(np.random.randint(1, total_floor + 1), total_floor)
        
        # Number of balconies
        balcony_num = np.random.choice([0, 1, 2, 3], p=[0.1, 0.5, 0.3, 0.1])
        
        # Facing direction (1-8, representing N, S, E, W, NE, NW, SE, SW)
        facing = np.random.randint(1, 9)
        
        # Generate property ID
        prop_id = f"PROP{str(i+1).zfill(5)}"
        
        # Amenities (comma-separated IDs)
        possible_amenities = ['1', '12', '17', '19', '21', '23', '24', '25', '26', '29', '32', '40', '41', '42', '44', '45', '46', '47']
        num_amenities = np.random.randint(3, 10)
        amenities = ','.join(np.random.choice(possible_amenities, size=min(num_amenities, len(possible_amenities)), replace=False))
        
        # Features (comma-separated IDs)
        possible_features = ['1', '6', '8', '9', '17', '19', '20', '28', '30']
        num_features = np.random.randint(1, 5)
        features = ','.join(np.random.choice(possible_features, size=min(num_features, len(possible_features)), replace=False))
        
        # Is premium property
        is_premium = np.random.choice([True, False], p=[0.3, 0.7])
        
        # Add to data dictionary
        data['PROPERTY_TYPE'].append(property_type)
        data['CITY'].append(city)
        data['LOCALITY_NAME'].append(locality)
        data['BEDROOM_NUM'].append(bedroom_num)
        data['FURNISH'].append(furnish_status)
        data['MIN_AREA_SQFT'].append(area)
        data['MAX_AREA_SQFT'].append(area)
        data['PRICE_PER_UNIT_AREA'].append(price_per_sqft)
        data['PRICE'].append(price)
        data['AGE'].append(age)
        data['TOTAL_FLOOR'].append(total_floor)
        data['FLOOR_NUM'].append(floor_num)
        data['BALCONY_NUM'].append(balcony_num)
        data['FACING'].append(facing)
        data['PROP_ID'].append(prop_id)
        data['AMENITIES'].append(amenities)
        data['FEATURES'].append(features)
        data['IS_PREMIUM'].append(is_premium)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    return df

def save_data(df, data_dir=None):
    """Save the generated data to CSV and PKL files"""
    if data_dir is None:
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    
    # Ensure directory exists
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    # Save as CSV
    csv_path = os.path.join(data_dir, 'mumbai.csv')
    df.to_csv(csv_path, index=False)
    print(f"Saved CSV to: {csv_path}")
    
    # Save as PKL
    pkl_path = os.path.join(data_dir, 'mumbai_data.pkl')
    df.to_pickle(pkl_path)
    print(f"Saved PKL to: {pkl_path}")
    
    return csv_path, pkl_path

def main():
    """Main function to generate and save the data"""
    # Get number of records from command-line argument or use default
    import sys
    num_records = 10000
    if len(sys.argv) > 1:
        try:
            num_records = int(sys.argv[1])
        except ValueError:
            print(f"Invalid number of records: {sys.argv[1]}. Using default: {num_records}")
    
    # Generate data
    df = generate_mumbai_property_data(num_records)
    
    # Save data
    csv_path, pkl_path = save_data(df)
    
    print(f"Generated {len(df)} property records")
    print(f"CSV saved at: {csv_path}")
    print(f"PKL saved at: {pkl_path}")

if __name__ == "__main__":
    main()