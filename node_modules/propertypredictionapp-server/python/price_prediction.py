#!/usr/bin/env python3
# server/python/price_prediction.py

import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import joblib
import os
from datetime import datetime, timedelta

# Check if model exists, otherwise train it
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'price_prediction_model.pkl')

def load_data():
    """Load and preprocess the dataset"""
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'mumbai.csv')
    
    try:
        df = pd.read_csv(csv_path)
        # Print column names to help debug
        print(f"Loaded CSV columns: {list(df.columns)}")
        # Basic preprocessing - handle missing values, etc.
        df = df.fillna(0)
        return df
    except Exception as e:
        print(f"Error loading data: {str(e)}", file=sys.stderr)
        # Create a sample dataset based on our analysis if file doesn't exist
        return create_sample_dataset()

# def preprocess_data(df):
#     """Preprocess the data for training with flexible column names"""
#     # Print columns to debug
#     print(f"DataFrame columns: {list(df.columns)}")
    
#     # Map expected column names to actual columns
#     column_mapping = {
#         'property_type': None,
#         'city': None,
#         'locality': None,
#         'bedrooms': None,
#         'furnish': None,
#         'area': None,
#         'age': None
#     }
    
#     # Try different possible column names
#     property_type_options = ['PROPERTY_TYPE', 'propertyType', 'property_type', 'PropertyType']
#     city_options = ['CITY', 'city', 'City']
#     locality_options = ['LOCALITY_NAME', 'location.LOCALITY_NAME', 'locality', 'localityName']
#     bedroom_options = ['BEDROOM_NUM', 'bedroomNum', 'bedrooms', 'bedroom_num']
#     furnish_options = ['FURNISH', 'furnishStatus', 'furnish_status', 'furnish']
#     area_options = ['MIN_AREA_SQFT', 'minAreaSqft', 'area', 'min_area']
#     age_options = ['AGE', 'age', 'property_age']
    
#     # Find matching columns
#     for col in property_type_options:
#         if col in df.columns:
#             column_mapping['property_type'] = col
#             break
            
#     for col in city_options:
#         if col in df.columns:
#             column_mapping['city'] = col
#             break
            
#     for col in locality_options:
#         if col in df.columns:
#             column_mapping['locality'] = col
#             break
            
#     for col in bedroom_options:
#         if col in df.columns:
#             column_mapping['bedrooms'] = col
#             break
            
#     for col in furnish_options:
#         if col in df.columns:
#             column_mapping['furnish'] = col
#             break
            
#     for col in area_options:
#         if col in df.columns:
#             column_mapping['area'] = col
#             break
            
#     for col in age_options:
#         if col in df.columns:
#             column_mapping['age'] = col
#             break
    
#     # Check if any required columns are missing
#     missing_columns = [k for k, v in column_mapping.items() if v is None]
#     if missing_columns:
#         print(f"Missing required columns: {missing_columns}", file=sys.stderr)
#         print("Falling back to synthetic data generation", file=sys.stderr)
#         return create_fallback_data()
    
#     # Create a new dataframe with renamed columns for consistent processing
#     processed_df = pd.DataFrame()
#     for new_name, old_name in column_mapping.items():
#         processed_df[new_name] = df[old_name]
    
#     # Select features for model training
#     X = processed_df[['property_type', 'city', 'locality', 'bedrooms', 'furnish', 'area', 'age']].copy()
    
#     # Assuming price or price_per_unit is the target variable
#     # Try to find the price column
#     price_column = None
#     price_options = ['PRICE', 'price', 'Price', 'PRICE_PER_UNIT_AREA', 'pricePerUnitArea']
#     for col in price_options:
#         if col in df.columns:
#             price_column = col
#             break
    
#     if price_column:
#         y = df[price_column]
#     else:
#         # If no price column, create synthetic prices based on area
#         print("No price column found. Using synthetic prices.", file=sys.stderr)
#         y = processed_df['area'] * np.random.uniform(10000, 20000, len(processed_df))
    
#     # Handle categorical variables
#     categorical_cols = ['property_type', 'city', 'locality']
#     numerical_cols = ['bedrooms', 'furnish', 'area', 'age']
    
#     # One-hot encode categorical features
#     try:
#         # For newer scikit-learn versions
#         encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
#     except TypeError:
#         # For older scikit-learn versions
#         encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
        
#     encoded_cats = encoder.fit_transform(X[categorical_cols])
    
#     # Scale numerical features
#     scaler = StandardScaler()
#     scaled_nums = scaler.fit_transform(X[numerical_cols])
    
#     # Combine all features
#     X_processed = np.hstack([encoded_cats, scaled_nums])
    
#     return X_processed, y, encoder, scaler, categorical_cols, numerical_cols

def preprocess_data(df):
    """Preprocess the data for training"""
    # Print the actual columns in the DataFrame for debugging
    print(f"DataFrame columns: {list(df.columns)}")
    
    # Select relevant features
    features = ['PROPERTY_TYPE', 'CITY', 'location.LOCALITY_NAME', 'BEDROOM_NUM', 'FURNISH', 'MIN_AREA_SQFT', 'AGE']
    
    # Verify all columns exist in the DataFrame
    missing_columns = [col for col in features if col not in df.columns]
    if missing_columns:
        print(f"Warning: Missing columns in DataFrame: {missing_columns}")
        # Handle missing columns (create them with default values or use alternative columns)
        for col in missing_columns:
            if col == 'AGE':
                df['AGE'] = 0  # Default age
            # Add similar handling for other potentially missing columns
    
    X = df[features].copy()
    y = df['PRICE_PER_UNIT_AREA']
    
    # Handle categorical variables
    categorical_cols = ['PROPERTY_TYPE', 'CITY', 'location.LOCALITY_NAME']
    numerical_cols = ['BEDROOM_NUM', 'FURNISH', 'MIN_AREA_SQFT', 'AGE']
    
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
    
    # Combine all features
    X_processed = np.hstack([encoded_cats, scaled_nums])
    
    return X_processed, y, encoder, scaler, categorical_cols, numerical_cols

def create_fallback_data():
    """Create fallback data when DataFrame has unexpected structure"""
    print("Creating fallback synthetic data for model training")
    
    # Create synthetic X and y data
    n_samples = 100
    n_features = 20  # Will have 20 features after one-hot encoding
    
    X = np.random.rand(n_samples, n_features)
    y = np.random.uniform(10000, 30000, n_samples)  # Price per sq ft
    
    # Create dummy encoder and scaler
    try:
        encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    except TypeError:
        encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
        
    encoder.fit([['Type1'], ['Type2'], ['Type3']])
    
    scaler = StandardScaler()
    scaler.fit(np.random.rand(100, 4))  # Fit with dummy data
    
    categorical_cols = ['property_type', 'city', 'locality']
    numerical_cols = ['bedrooms', 'furnish', 'area', 'age']
    
    return X, y, encoder, scaler, categorical_cols, numerical_cols

def create_fallback_preprocessing():
    """Create fallback preprocessing when dataframe has unexpected columns"""
    print("Using fallback preprocessing due to column mismatch")
    
    # Create dummy data
    dummy_data = {
        'property_type': ['Residential Apartment', 'Independent House/Villa'],
        'city': ['Mumbai', 'Thane'],
        'locality': ['Andheri', 'Powai'],
        'bedrooms': [2, 3],
        'furnish': [0, 1],
        'area': [1000, 1500],
        'age': [2, 5]
    }
    
    dummy_df = pd.DataFrame(dummy_data)
    
    # Simple preprocessing
    X = np.array([[1, 0, 1, 0, 2, 1000, 2], [0, 1, 0, 1, 3, 1500, 5]])
    y = np.array([15000, 20000])  # price per sqft
    
    # Basic encoder and scaler
    encoder = OneHotEncoder(sparse_output=False)
    encoder.fit([['Residential Apartment'], ['Independent House/Villa']])
    
    scaler = StandardScaler()
    scaler.fit(X)
    
    return X, y, encoder, scaler, ['property_type', 'city', 'locality'], ['bedrooms', 'furnish', 'area', 'age']

def train_model(X, y):
    """Train the prediction model"""
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    return model

# def load_or_train_model():
#     """Load the model if it exists, otherwise train a new one"""
#     models_dir = os.path.dirname(MODEL_PATH)
#     if not os.path.exists(models_dir):
#         os.makedirs(models_dir)
    
#     if os.path.exists(MODEL_PATH):
#         try:
#             model_data = joblib.load(MODEL_PATH)
#             return model_data
#         except Exception as e:
#             print(f"Error loading model: {str(e)}", file=sys.stderr)
    
#     # Train new model
#     df = load_data()
#     X, y, encoder, scaler, categorical_cols, numerical_cols = preprocess_data(df)
#     model = train_model(X, y)
    
#     # Save model and preprocessing objects
#     model_data = {
#         'model': model,
#         'encoder': encoder,
#         'scaler': scaler,
#         'categorical_cols': categorical_cols,
#         'numerical_cols': numerical_cols,
#         'annual_growth_rate': 0.03  # Assume 3% annual growth
#     }
    
#     joblib.dump(model_data, MODEL_PATH)
#     return model_data

def load_or_train_model():
    """Load the model if it exists, otherwise train a new one"""
    models_dir = os.path.dirname(MODEL_PATH)
    print(f"Model directory path: {models_dir}")
    
    try:
        if not os.path.exists(models_dir):
            print(f"Creating models directory: {models_dir}")
            os.makedirs(models_dir, exist_ok=True)
        
        if os.path.exists(MODEL_PATH):
            try:
                print(f"Loading existing model from: {MODEL_PATH}")
                model_data = joblib.load(MODEL_PATH)
                return model_data
            except Exception as e:
                print(f"Error loading model: {str(e)}", file=sys.stderr)
        
        print("Training new model...")
        df = load_data()
        print(f"Loaded dataset with {len(df)} records")
        
        X, y, encoder, scaler, categorical_cols, numerical_cols = preprocess_data(df)
        print(f"Preprocessed data: X shape {X.shape}, y shape {y.shape}")
        
        model = train_model(X, y)
        print("Model training completed")
        
        # Save model and preprocessing objects
        model_data = {
            'model': model,
            'encoder': encoder,
            'scaler': scaler,
            'categorical_cols': categorical_cols,
            'numerical_cols': numerical_cols,
            'annual_growth_rate': 0.03  # Assume 3% annual growth
        }
        
        print(f"Saving model to: {MODEL_PATH}")
        joblib.dump(model_data, MODEL_PATH)
        print("Model saved successfully")
        return model_data
    except Exception as e:
        print(f"Error in load_or_train_model: {str(e)}", file=sys.stderr)
        # Return a basic model as fallback
        return create_fallback_model()


def create_fallback_model():
    """Create a simple fallback model for when training fails"""
    print("Creating fallback model...")
    
    # Create a very simple dataset
    X = np.array([[1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 7]])
    y = np.array([10000, 15000, 20000])
    
    # Train a simple model
    model = RandomForestRegressor(n_estimators=10, random_state=42)
    model.fit(X, y)
    
    # Create dummy encoder and scaler
    #encoder = OneHotEncoder(sparse=False)
    # For newer versions of scikit-learn (>=1.2.0)
    try:
        encoder = OneHotEncoder(sparse_output=False)
    except TypeError:
    # Fallback for older versions
        encoder = OneHotEncoder(sparse=False)
    encoder.fit([['Type1'], ['Type2']])
    
    scaler = StandardScaler()
    scaler.fit(X)
    
    return {
        'model': model,
        'encoder': encoder,
        'scaler': scaler,
        'categorical_cols': ['property_type', 'city', 'locality'],
        'numerical_cols': ['bedroomNum', 'furnishStatus', 'minAreaSqft', 'age'],
        'annual_growth_rate': 0.05
    }


def predict_price(model_data, property_data, years=5):
    """Predict property price for the given number of years"""
    model = model_data['model']
    encoder = model_data['encoder']
    scaler = model_data['scaler']
    categorical_cols = model_data['categorical_cols']
    numerical_cols = model_data['numerical_cols']
    annual_growth_rate = model_data['annual_growth_rate']

    print(f"Expected categorical columns: {categorical_cols}")
    print(f"Expected numerical columns: {numerical_cols}")
    print(f"Property data keys: {list(property_data.keys())}")
    
    # Create a DataFrame with the property data
    # property_df = pd.DataFrame({
    #     'PROPERTY_TYPE': [property_data['propertyType']],
    #     'CITY': [property_data['city']],
    #     'location.LOCALITY_NAME': [property_data['locality']],
    #     'BEDROOM_NUM': [property_data['bedroomNum'] if property_data['bedroomNum'] is not None else 0],
    #     'FURNISH': [property_data['furnishStatus']],
    #     'MIN_AREA_SQFT': [property_data['area']],
    #     'AGE': [0]  # Assuming new property
    # })

    property_df = pd.DataFrame({
        'PROPERTY_TYPE': [property_data['propertyType']],
        'CITY': [property_data['city']],
        'location.LOCALITY_NAME': [property_data['locality']],
        'BEDROOM_NUM': [property_data['bedroomNum'] if property_data['bedroomNum'] is not None else 0],
        'FURNISH': [property_data['furnishStatus']],
        'MIN_AREA_SQFT': [property_data['area']],
        'AGE': [0]  # Assuming new property
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
    
    return {
        'currentPricePrediction': round(base_price, 2),
        'currentPricePerSqft': round(predicted_price_per_sqft, 2),
        'futurePredictions': future_prices
    }

def main():
    """Main function to execute the script"""
    if len(sys.argv) != 2:
        print("Usage: python price_prediction.py <input_json_file>", file=sys.stderr)
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
        
        # Output result as JSON
        print(json.dumps(predictions))
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()