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
    # In a real application, you'd load the CSV file here
    # For this example, we'll create a dummy dataset based on analysis results
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'mumbai.csv')
    
    try:
        df = pd.read_csv(csv_path)
        # Basic preprocessing - handle missing values, etc.
        df = df.fillna(0)
        return df
    except Exception as e:
        print(f"Error loading data: {str(e)}", file=sys.stderr)
        # Create a sample dataset based on our analysis if file doesn't exist
        return create_sample_dataset()

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
    return df

def preprocess_data(df):
    """Preprocess the data for training"""
    # Select relevant features
    features = ['PROPERTY_TYPE', 'CITY', 'location.LOCALITY_NAME', 'BEDROOM_NUM', 'FURNISH', 'MIN_AREA_SQFT', 'AGE']
    X = df[features].copy()
    y = df['PRICE_PER_UNIT_AREA']
    
    # Handle categorical variables
    categorical_cols = ['PROPERTY_TYPE', 'CITY', 'location.LOCALITY_NAME']
    numerical_cols = ['BEDROOM_NUM', 'FURNISH', 'MIN_AREA_SQFT', 'AGE']
    
    # One-hot encode categorical features
    encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
    encoded_cats = encoder.fit_transform(X[categorical_cols])
    
    # Scale numerical features
    scaler = StandardScaler()
    scaled_nums = scaler.fit_transform(X[numerical_cols])
    
    # Combine all features
    X_processed = np.hstack([encoded_cats, scaled_nums])
    
    return X_processed, y, encoder, scaler, categorical_cols, numerical_cols

def train_model(X, y):
    """Train the prediction model"""
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    return model

def load_or_train_model():
    """Load the model if it exists, otherwise train a new one"""
    models_dir = os.path.dirname(MODEL_PATH)
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)
    
    if os.path.exists(MODEL_PATH):
        try:
            model_data = joblib.load(MODEL_PATH)
            return model_data
        except Exception as e:
            print(f"Error loading model: {str(e)}", file=sys.stderr)
    
    # Train new model
    df = load_data()
    X, y, encoder, scaler, categorical_cols, numerical_cols = preprocess_data(df)
    model = train_model(X, y)
    
    # Save model and preprocessing objects
    model_data = {
        'model': model,
        'encoder': encoder,
        'scaler': scaler,
        'categorical_cols': categorical_cols,
        'numerical_cols': numerical_cols,
        'annual_growth_rate': 0.03  # Assume 3% annual growth
    }
    
    joblib.dump(model_data, MODEL_PATH)
    return model_data

def predict_price(model_data, property_data, years=5):
    """Predict property price for the given number of years"""
    model = model_data['model']
    encoder = model_data['encoder']
    scaler = model_data['scaler']
    categorical_cols = model_data['categorical_cols']
    numerical_cols = model_data['numerical_cols']
    annual_growth_rate = model_data['annual_growth_rate']
    
    # Create a DataFrame with the property data
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