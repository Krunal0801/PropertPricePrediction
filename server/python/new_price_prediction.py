# #!/usr/bin/env python3
# # server/python/new_price_prediction.py - Fixed version with better output handling

# import sys
# import json
# import pandas as pd
# import numpy as np
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.preprocessing import OneHotEncoder, StandardScaler
# import joblib
# import os
# from datetime import datetime, timedelta
# import traceback

# # Send debug messages to stderr instead of stdout
# def debug_print(message):
#     print(message, file=sys.stderr)

# # Model path
# MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'price_prediction_model.pkl')

# def create_sample_dataset():
#     """Create a sample dataset with consistent column names"""
#     debug_print("Creating sample dataset with consistent column structure")
    
#     # Number of samples
#     n_samples = 200
    
#     # Property types
#     property_types = [
#         'Residential Apartment', 
#         'Independent House/Villa', 
#         'Farm House', 
#         'Studio Apartment'
#     ]
    
#     # Cities in Mumbai
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
#         'Malad West', 'Thane West', 'Kharghar', 'Vashi'
#     ]
    
#     # Create dataset
#     data = {
#         'propertyType': np.random.choice(property_types, n_samples),
#         'city': np.random.choice(cities, n_samples),
#         'locality': np.random.choice(localities, n_samples),
#         'bedroomNum': np.random.choice([1, 2, 3, 4, 5], n_samples),
#         'furnishStatus': np.random.choice([0, 1, 2], n_samples),
#         'area': np.random.uniform(500, 2000, n_samples),
#         'age': np.random.randint(0, 15, n_samples)
#     }
    
#     # Create DataFrame
#     df = pd.DataFrame(data)
    
#     # Add price (based on area, location, bedrooms)
#     base_prices = {
#         'Andheri West': 12000, 
#         'Bandra West': 20000, 
#         'Powai': 15000,
#         'Goregaon East': 11000, 
#         'Malad West': 10000, 
#         'Thane West': 8000, 
#         'Kharghar': 7000, 
#         'Vashi': 9000
#     }
    
#     # Calculate price per sq ft based on various factors
#     df['pricePerSqft'] = df.apply(lambda row: 
#         base_prices.get(row['locality'], 10000) + 
#         (row['bedroomNum'] * 500) - 
#         (row['age'] * 200) +
#         (5000 if row['propertyType'] == 'Independent House/Villa' else 0) +
#         np.random.normal(0, 1000), 
#         axis=1)
    
#     # Ensure minimum price
#     df['pricePerSqft'] = df['pricePerSqft'].apply(lambda x: max(6000, x))
    
#     # Calculate total price
#     df['price'] = df['pricePerSqft'] * df['area']
    
#     debug_print(f"Created sample dataset with {len(df)} records")
#     debug_print(f"Columns: {df.columns.tolist()}")
    
#     return df

# def create_fallback_model():
#     """Create a simple fallback model for when training fails"""
#     debug_print("Creating fallback model with dummy data...")
    
#     # Create a simple dataset
#     n_samples = 100
    
#     # Property types
#     property_types = ['Residential Apartment', 'Independent House/Villa']
#     cities = ['Mumbai Andheri-Dahisar', 'Thane']
#     localities = ['Andheri West', 'Powai']
    
#     # Create dataset
#     data = {
#         'propertyType': np.random.choice(property_types, n_samples),
#         'city': np.random.choice(cities, n_samples),
#         'locality': np.random.choice(localities, n_samples),
#         'bedroomNum': np.random.choice([1, 2, 3], n_samples),
#         'furnishStatus': np.random.choice([0, 1], n_samples),
#         'area': np.random.uniform(500, 1500, n_samples),
#         'age': np.random.randint(0, 10, n_samples)
#     }
    
#     # Create DataFrame
#     df = pd.DataFrame(data)
    
#     # Calculate price (based on simple formula)
#     base_price_per_sqft = 15000
#     df['pricePerSqft'] = df.apply(lambda row: 
#         base_price_per_sqft + 
#         (2000 if row['propertyType'] == 'Independent House/Villa' else 0) +
#         (1000 if row['city'] == 'Mumbai Andheri-Dahisar' else 0) +
#         (row['bedroomNum'] * 500) - 
#         (row['age'] * 200), 
#         axis=1)
    
#     # Process features
#     feature_cols = ['propertyType', 'city', 'locality', 'bedroomNum', 'furnishStatus', 'area', 'age']
#     target_col = 'pricePerSqft'
    
#     # Split features and target
#     X = df[feature_cols]
#     y = df[target_col]
    
#     # Identify categorical and numerical columns
#     categorical_cols = ['propertyType', 'city', 'locality']
#     numerical_cols = ['bedroomNum', 'furnishStatus', 'area', 'age']
    
#     # One-hot encode categorical features
#     try:
#         encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
#     except TypeError:
#         encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
        
#     encoded_cats = encoder.fit_transform(X[categorical_cols])
    
#     # Scale numerical features
#     scaler = StandardScaler()
#     scaled_nums = scaler.fit_transform(X[numerical_cols])
    
#     # Train model
#     model = RandomForestRegressor(n_estimators=50, random_state=42)
#     model.fit(np.hstack([encoded_cats, scaled_nums]), y)
    
#     debug_print("Fallback model created successfully")
    
#     return {
#         'model': model,
#         'encoder': encoder,
#         'scaler': scaler,
#         'categorical_cols': categorical_cols,
#         'numerical_cols': numerical_cols,
#         'annual_growth_rate': 0.05
#     }

# def load_or_train_model():
#     """Load the model if it exists, otherwise train a new one"""
#     try:
#         models_dir = os.path.dirname(MODEL_PATH)
#         debug_print(f"Model directory path: {models_dir}")
        
#         # Ensure the models directory exists
#         if not os.path.exists(models_dir):
#             debug_print(f"Creating models directory: {models_dir}")
#             os.makedirs(models_dir, exist_ok=True)
            
#         # Create a sample dataset (always use this for consistent column names)
#         df = create_sample_dataset()
            
#         # Try to load existing model if it exists
#         if os.path.exists(MODEL_PATH):
#             try:
#                 debug_print(f"Loading existing model from: {MODEL_PATH}")
#                 model_data = joblib.load(MODEL_PATH)
#                 debug_print("Model loaded successfully!")
#                 return model_data
#             except Exception as e:
#                 debug_print(f"Error loading model: {str(e)}")
#                 debug_print("Will create a new model instead")
#         else:
#             debug_print(f"Model file not found at {MODEL_PATH}")
#             debug_print("Will create a new model")
        
#         debug_print("Training new model...")
        
#         # Select features for model training
#         feature_cols = ['propertyType', 'city', 'locality', 'bedroomNum', 'furnishStatus', 'area', 'age']
#         target_col = 'pricePerSqft'
        
#         # Split features and target
#         X = df[feature_cols]
#         y = df[target_col]
        
#         # Identify categorical and numerical columns
#         categorical_cols = ['propertyType', 'city', 'locality']
#         numerical_cols = ['bedroomNum', 'furnishStatus', 'area', 'age']
        
#         # One-hot encode categorical features
#         try:
#             # For newer scikit-learn versions
#             encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
#         except TypeError:
#             # For older scikit-learn versions
#             encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
            
#         encoded_cats = encoder.fit_transform(X[categorical_cols])
        
#         # Scale numerical features
#         scaler = StandardScaler()
#         scaled_nums = scaler.fit_transform(X[numerical_cols])
        
#         # Combine features
#         X_processed = np.hstack([encoded_cats, scaled_nums])
        
#         # Train model
#         model = RandomForestRegressor(n_estimators=100, random_state=42)
#         model.fit(X_processed, y)
        
#         # Save model and preprocessing objects
#         model_data = {
#             'model': model,
#             'encoder': encoder,
#             'scaler': scaler,
#             'categorical_cols': categorical_cols,
#             'numerical_cols': numerical_cols,
#             'annual_growth_rate': 0.05  # 5% annual growth
#         }
        
#         debug_print(f"Saving model to: {MODEL_PATH}")
#         try:
#             joblib.dump(model_data, MODEL_PATH)
#             debug_print("Model saved successfully")
#         except Exception as e:
#             debug_print(f"Error saving model: {str(e)}")
#             debug_print("Continuing with in-memory model")
        
#         return model_data
#     except Exception as e:
#         debug_print(f"Error in load_or_train_model: {str(e)}")
#         traceback.print_exc(file=sys.stderr)
#         # Create a fallback model instead of exiting
#         debug_print("Creating fallback model due to error...")
#         return create_fallback_model()

# def predict_price(model_data, property_data, years=5):
#     """Predict property price for the given number of years"""
#     try:
#         debug_print("Making predictions...")
        
#         model = model_data['model']
#         encoder = model_data['encoder']
#         scaler = model_data['scaler']
#         categorical_cols = model_data['categorical_cols']
#         numerical_cols = model_data['numerical_cols']
#         annual_growth_rate = model_data['annual_growth_rate']
        
#         # Create a DataFrame with the property data
#         property_df = pd.DataFrame({
#             'propertyType': [property_data['propertyType']],
#             'city': [property_data['city']],
#             'locality': [property_data['locality']],
#             'bedroomNum': [property_data['bedroomNum'] if property_data['bedroomNum'] is not None else 0],
#             'furnishStatus': [property_data['furnishStatus']],
#             'area': [property_data['area']],
#             'age': [0]  # Assuming new property
#         })
        
#         # Encode categorical features
#         encoded_cats = encoder.transform(property_df[categorical_cols])
        
#         # Scale numerical features
#         scaled_nums = scaler.transform(property_df[numerical_cols])
        
#         # Combine features
#         X_property = np.hstack([encoded_cats, scaled_nums])
        
#         # Predict price per square foot
#         predicted_price_per_sqft = model.predict(X_property)[0]
        
#         # Calculate base price
#         base_price = predicted_price_per_sqft * property_data['area']
        
#         # Calculate future prices for each year
#         future_prices = []
#         for year in range(1, years + 1):
#             future_price = base_price * ((1 + annual_growth_rate) ** year)
            
#             # Calculate price per sqft for the year
#             future_price_per_sqft = future_price / property_data['area']
            
#             # Get the year
#             prediction_year = datetime.now().year + year
            
#             future_prices.append({
#                 'year': prediction_year,
#                 'predictedPrice': round(future_price, 2),
#                 'predictedPricePerSqft': round(future_price_per_sqft, 2),
#                 'growthRate': round(annual_growth_rate * 100, 2)
#             })
        
#         debug_print("Predictions completed")
        
#         return {
#             'currentPricePrediction': round(base_price, 2),
#             'currentPricePerSqft': round(predicted_price_per_sqft, 2),
#             'futurePredictions': future_prices
#         }
#     except Exception as e:
#         debug_print(f"Error in predict_price: {str(e)}")
#         traceback.print_exc(file=sys.stderr)
#         return {
#             'error': str(e),
#             'currentPricePrediction': 0,
#             'currentPricePerSqft': 0,
#             'futurePredictions': []
#         }

# def main():
#     """Main function to execute the script"""
#     if len(sys.argv) != 2:
#         debug_print("Usage: python price_prediction.py <input_json_file>")
#         sys.exit(1)
    
#     input_file = sys.argv[1]
    
#     try:
#         # Read input JSON file
#         with open(input_file, 'r') as f:
#             property_data = json.load(f)
        
#         # Load or train the model
#         model_data = load_or_train_model()
        
#         # Get prediction years
#         years = property_data.get('years', 5)
        
#         # Predict prices
#         predictions = predict_price(model_data, property_data, years)
        
#         # Output result as JSON - only print this to stdout
#         debug_print("Final output:")
#         print(json.dumps(predictions))
        
#     except Exception as e:
#         debug_print(f"Error: {str(e)}")
#         traceback.print_exc(file=sys.stderr)
#         sys.exit(1)

# if __name__ == "__main__":
#     main()


#!/usr/bin/env python3
# server/python/new_price_prediction.py - Enhanced with dynamic growth rate and location factors

import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import joblib
import os
import requests
from datetime import datetime, timedelta
import traceback
import math

# Send debug messages to stderr instead of stdout
def debug_print(message):
    print(message, file=sys.stderr)

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'price_prediction_model.pkl')
# MongoDB API endpoints for fetching nearby properties
PROPERTIES_API_URL = "http://localhost:5000/api/properties/map/nearby"

def create_sample_dataset():
    # Same as before
    debug_print("Creating sample dataset with consistent column structure")
    
    # Number of samples
    n_samples = 200
    
    # Property types
    property_types = [
        'Residential Apartment', 
        'Independent House/Villa', 
        'Farm House', 
        'Studio Apartment'
    ]
    
    # Cities in Mumbai
    cities = [
        'Mumbai Andheri-Dahisar',
        'Central Mumbai suburbs',
        'Navi Mumbai',
        'South Mumbai',
        'Thane'
    ]
    
    # Localities
    localities = [
        'Andheri West', 'Bandra West', 'Powai', 'Goregaon East', 
        'Malad West', 'Thane West', 'Kharghar', 'Vashi'
    ]
    
    # Create dataset
    data = {
        'propertyType': np.random.choice(property_types, n_samples),
        'city': np.random.choice(cities, n_samples),
        'locality': np.random.choice(localities, n_samples),
        'bedroomNum': np.random.choice([1, 2, 3, 4, 5], n_samples),
        'furnishStatus': np.random.choice([0, 1, 2], n_samples),
        'area': np.random.uniform(500, 2000, n_samples),
        'age': np.random.randint(0, 15, n_samples),
        'latitude': np.random.uniform(19.0, 19.3, n_samples),  # Mumbai latitude range
        'longitude': np.random.uniform(72.8, 73.1, n_samples)  # Mumbai longitude range
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Add price (based on area, location, bedrooms)
    base_prices = {
        'Andheri West': 12000, 
        'Bandra West': 20000, 
        'Powai': 15000,
        'Goregaon East': 11000, 
        'Malad West': 10000, 
        'Thane West': 8000, 
        'Kharghar': 7000, 
        'Vashi': 9000
    }
    
    # Calculate price per sq ft based on various factors
    df['pricePerSqft'] = df.apply(lambda row: 
        base_prices.get(row['locality'], 10000) + 
        (row['bedroomNum'] * 500) - 
        (row['age'] * 200) +
        (5000 if row['propertyType'] == 'Independent House/Villa' else 0) +
        np.random.normal(0, 1000), 
        axis=1)
    
    # Ensure minimum price
    df['pricePerSqft'] = df['pricePerSqft'].apply(lambda x: max(6000, x))
    
    # Calculate total price
    df['price'] = df['pricePerSqft'] * df['area']
    
    # Add historical growth rate data (with variations by locality)
    growth_rates = {
        'Andheri West': 0.06, 
        'Bandra West': 0.07, 
        'Powai': 0.055,
        'Goregaon East': 0.05, 
        'Malad West': 0.045, 
        'Thane West': 0.04, 
        'Kharghar': 0.065, 
        'Vashi': 0.05
    }
    
    df['growthRate'] = df.apply(lambda row: 
        growth_rates.get(row['locality'], 0.05) + 
        np.random.normal(0, 0.01),  # Add some random variation
        axis=1)
    
    # Ensure growth rate is positive and reasonable
    df['growthRate'] = df['growthRate'].apply(lambda x: max(0.02, min(x, 0.1)))
    
    debug_print(f"Created sample dataset with {len(df)} records")
    debug_print(f"Columns: {df.columns.tolist()}")
    
    return df

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers using the Haversine formula"""
    # Convert coordinates from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

def get_nearby_properties(latitude, longitude, radius=2):
    """Fetch properties within the specified radius (km) using the API"""
    try:
        # Try to fetch from API first
        debug_print(f"Fetching nearby properties within {radius}km of ({latitude}, {longitude})")
        response = requests.get(
            PROPERTIES_API_URL, 
            params={'lat': latitude, 'lng': longitude, 'radius': radius},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('properties'):
                properties = data.get('properties', [])
                debug_print(f"Found {len(properties)} nearby properties from API")
                return properties
        
        debug_print("Failed to get properties from API. Using simulated data.")
        # If API fails or returns no properties, generate simulated nearby properties
        return []
    
    except Exception as e:
        debug_print(f"Error fetching nearby properties: {str(e)}")
        # If there's an error, return an empty list
        return []

def create_fallback_model():
    """Create a simple fallback model for when training fails"""
    debug_print("Creating fallback model with dummy data...")
    
    # Create a simple dataset
    n_samples = 100
    
    # Property types
    property_types = ['Residential Apartment', 'Independent House/Villa']
    cities = ['Mumbai Andheri-Dahisar', 'Thane']
    localities = ['Andheri West', 'Powai']
    
    # Create dataset
    data = {
        'propertyType': np.random.choice(property_types, n_samples),
        'city': np.random.choice(cities, n_samples),
        'locality': np.random.choice(localities, n_samples),
        'bedroomNum': np.random.choice([1, 2, 3], n_samples),
        'furnishStatus': np.random.choice([0, 1], n_samples),
        'area': np.random.uniform(500, 1500, n_samples),
        'age': np.random.randint(0, 10, n_samples),
        'nearbyPropertyCount': np.random.randint(0, 20, n_samples),
        'avgNearbyPrice': np.random.uniform(10000, 20000, n_samples),
        'growthRate': np.random.uniform(0.04, 0.06, n_samples)
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Calculate price (based on simple formula)
    base_price_per_sqft = 15000
    df['pricePerSqft'] = df.apply(lambda row: 
        base_price_per_sqft + 
        (2000 if row['propertyType'] == 'Independent House/Villa' else 0) +
        (1000 if row['city'] == 'Mumbai Andheri-Dahisar' else 0) +
        (row['bedroomNum'] * 500) - 
        (row['age'] * 200) + 
        (row['nearbyPropertyCount'] * 100) +  # More nearby properties increases value
        ((row['avgNearbyPrice'] - 15000) * 0.5),  # Influence of nearby property prices
        axis=1)
    
    # Process features
    feature_cols = ['propertyType', 'city', 'locality', 'bedroomNum', 'furnishStatus', 
                    'area', 'age', 'nearbyPropertyCount', 'avgNearbyPrice']
    target_col = 'pricePerSqft'
    
    # Split features and target
    X = df[feature_cols]
    y = df[target_col]
    
    # Identify categorical and numerical columns
    categorical_cols = ['propertyType', 'city', 'locality']
    numerical_cols = ['bedroomNum', 'furnishStatus', 'area', 'age', 
                      'nearbyPropertyCount', 'avgNearbyPrice']
    
    # One-hot encode categorical features
    try:
        encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    except TypeError:
        encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
        
    encoded_cats = encoder.fit_transform(X[categorical_cols])
    
    # Scale numerical features
    scaler = StandardScaler()
    scaled_nums = scaler.fit_transform(X[numerical_cols])
    
    # Train model
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(np.hstack([encoded_cats, scaled_nums]), y)
    
    debug_print("Fallback model created successfully")
    
    return {
        'model': model,
        'encoder': encoder,
        'scaler': scaler,
        'categorical_cols': categorical_cols,
        'numerical_cols': numerical_cols,
        'fallback_growth_rate': 0.05  # Default growth rate
    }

def load_or_train_model():
    """Load the model if it exists, otherwise train a new one"""
    try:
        models_dir = os.path.dirname(MODEL_PATH)
        debug_print(f"Model directory path: {models_dir}")
        
        # Ensure the models directory exists
        if not os.path.exists(models_dir):
            debug_print(f"Creating models directory: {models_dir}")
            os.makedirs(models_dir, exist_ok=True)
            
        # Create a sample dataset (always use this for consistent column names)
        df = create_sample_dataset()
            
        # Try to load existing model if it exists
        if os.path.exists(MODEL_PATH):
            try:
                debug_print(f"Loading existing model from: {MODEL_PATH}")
                model_data = joblib.load(MODEL_PATH)
                debug_print("Model loaded successfully!")
                return model_data
            except Exception as e:
                debug_print(f"Error loading model: {str(e)}")
                debug_print("Will create a new model instead")
        else:
            debug_print(f"Model file not found at {MODEL_PATH}")
            debug_print("Will create a new model")
        
        debug_print("Training new model...")
        
        # Add simulated nearby property data
        df['nearbyPropertyCount'] = np.random.randint(0, 20, len(df))
        df['avgNearbyPrice'] = df.apply(
            lambda row: row['pricePerSqft'] * (1 + np.random.normal(0, 0.15)), 
            axis=1
        )
        
        # Select features for model training
        feature_cols = ['propertyType', 'city', 'locality', 'bedroomNum', 'furnishStatus', 
                        'area', 'age', 'nearbyPropertyCount', 'avgNearbyPrice']
        target_col = 'pricePerSqft'
        
        # Split features and target
        X = df[feature_cols]
        y = df[target_col]
        
        # Identify categorical and numerical columns
        categorical_cols = ['propertyType', 'city', 'locality']
        numerical_cols = ['bedroomNum', 'furnishStatus', 'area', 'age', 
                          'nearbyPropertyCount', 'avgNearbyPrice']
        
        # One-hot encode categorical features
        try:
            # For newer scikit-learn versions
            encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
        except TypeError:
            # For older scikit-learn versions
            encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
            
        encoded_cats = encoder.fit_transform(X[categorical_cols])
        
        # Scale numerical features
        scaler = StandardScaler()
        scaled_nums = scaler.fit_transform(X[numerical_cols])
        
        # Combine features
        X_processed = np.hstack([encoded_cats, scaled_nums])
        
        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_processed, y)
        
        # Train a separate model for growth rate prediction
        growth_model = RandomForestRegressor(n_estimators=50, random_state=42)
        growth_model.fit(X_processed, df['growthRate'])
        
        # Save model and preprocessing objects
        model_data = {
            'model': model,
            'growth_model': growth_model,
            'encoder': encoder,
            'scaler': scaler,
            'categorical_cols': categorical_cols,
            'numerical_cols': numerical_cols,
            'fallback_growth_rate': 0.05  # Default growth rate as fallback
        }
        
        debug_print(f"Saving model to: {MODEL_PATH}")
        try:
            joblib.dump(model_data, MODEL_PATH)
            debug_print("Model saved successfully")
        except Exception as e:
            debug_print(f"Error saving model: {str(e)}")
            debug_print("Continuing with in-memory model")
        
        return model_data
    except Exception as e:
        debug_print(f"Error in load_or_train_model: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        # Create a fallback model instead of exiting
        debug_print("Creating fallback model due to error...")
        return create_fallback_model()

def predict_price(model_data, property_data, years=5):
    """Predict property price for the given number of years with dynamic growth rate and location factors"""
    try:
        debug_print("Making predictions...")
        
        model = model_data['model']
        growth_model = model_data.get('growth_model')  # May not exist in fallback model
        encoder = model_data['encoder']
        scaler = model_data['scaler']
        categorical_cols = model_data['categorical_cols']
        numerical_cols = model_data['numerical_cols']
        fallback_growth_rate = model_data.get('fallback_growth_rate', 0.05)
        
        # Extract location data
        latitude = property_data.get('latitude')
        longitude = property_data.get('longitude')
        
        # Get nearby properties if coordinates are provided
        nearby_property_count = 0
        avg_nearby_price = 0
        
        if latitude and longitude:
            debug_print(f"Property has coordinates: ({latitude}, {longitude})")
            # Fetch nearby properties within 2km
            nearby_properties = get_nearby_properties(latitude, longitude, radius=2)
            
            nearby_property_count = len(nearby_properties)
            
            if nearby_property_count > 0:
                # Calculate average price per sqft of nearby properties
                nearby_prices = [p.get('pricePerUnitArea', 0) for p in nearby_properties]
                avg_nearby_price = sum(nearby_prices) / len(nearby_prices)
                debug_print(f"Found {nearby_property_count} nearby properties with avg price: {avg_nearby_price}")
        else:
            debug_print("No coordinates provided, using default nearby property values")
            # Use simulated values as fallback
            nearby_property_count = 5  # Default value
            avg_nearby_price = 15000  # Default value
        
        # Create a DataFrame with the property data, including location factors
        property_df = pd.DataFrame({
            'propertyType': [property_data['propertyType']],
            'city': [property_data['city']],
            'locality': [property_data['locality']],
            'bedroomNum': [property_data['bedroomNum'] if property_data['bedroomNum'] is not None else 0],
            'furnishStatus': [property_data['furnishStatus']],
            'area': [property_data['area']],
            'age': [property_data.get('age', 0)],  # Default to 0 if not provided
            'nearbyPropertyCount': [nearby_property_count],
            'avgNearbyPrice': [avg_nearby_price]
        })
        
        # Encode categorical features
        encoded_cats = encoder.transform(property_df[categorical_cols])
        
        # Scale numerical features
        scaled_nums = scaler.transform(property_df[numerical_cols])
        
        # Combine features
        X_property = np.hstack([encoded_cats, scaled_nums])
        
        # Predict price per square foot
        predicted_price_per_sqft = model.predict(X_property)[0]
        
        # Calculate base price
        base_price = predicted_price_per_sqft * property_data['area']
        
        # Predict growth rate dynamically if growth model is available
        if growth_model:
            annual_growth_rate = growth_model.predict(X_property)[0]
            debug_print(f"Predicted annual growth rate: {annual_growth_rate:.2%}")
        else:
            # Use fallback growth rate if no growth model or prediction fails
            annual_growth_rate = fallback_growth_rate
            debug_print(f"Using fallback annual growth rate: {annual_growth_rate:.2%}")
        
        # Ensure growth rate is within reasonable bounds
        annual_growth_rate = max(0.02, min(annual_growth_rate, 0.1))
        
        # Calculate future prices for each year
        future_prices = []
        for year in range(1, years + 1):
            future_price = base_price * ((1 + annual_growth_rate) ** year)
            
            # Calculate price per sqft for the year
            future_price_per_sqft = future_price / property_data['area']
            
            # Get the year
            prediction_year = datetime.now().year + year
            
            future_prices.append({
                'year': prediction_year,
                'predictedPrice': round(future_price, 2),
                'predictedPricePerSqft': round(future_price_per_sqft, 2),
                'growthRate': round(annual_growth_rate * 100, 2)
            })
        
        debug_print("Predictions completed")
        
        return {
            'currentPricePrediction': round(base_price, 2),
            'currentPricePerSqft': round(predicted_price_per_sqft, 2),
            'annualGrowthRate': round(annual_growth_rate * 100, 2),
            'nearbyPropertyCount': nearby_property_count,
            'avgNearbyPrice': round(avg_nearby_price, 2) if avg_nearby_price > 0 else None,
            'locationFactor': latitude and longitude,  # Boolean indicating if location was considered
            'futurePredictions': future_prices
        }
    except Exception as e:
        debug_print(f"Error in predict_price: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        return {
            'error': str(e),
            'currentPricePrediction': 0,
            'currentPricePerSqft': 0,
            'annualGrowthRate': 5.0,  # Default value
            'futurePredictions': []
        }

def main():
    """Main function to execute the script"""
    if len(sys.argv) != 2:
        debug_print("Usage: python price_prediction.py <input_json_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        # Read input JSON file
        with open(input_file, 'r') as f:
            property_data = json.load(f)
        
        # Load or train the model
        model_data = load_or_train_model()
        
        # Get prediction years
        years = property_data.get('years', 5)
        
        # Predict prices
        predictions = predict_price(model_data, property_data, years)
        
        # Output result as JSON - only print this to stdout
        debug_print("Final output:")
        print(json.dumps(predictions))
        
    except Exception as e:
        debug_print(f"Error: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()