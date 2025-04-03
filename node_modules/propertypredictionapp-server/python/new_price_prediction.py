#!/usr/bin/env python3
# server/python/new_price_prediction.py

import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import joblib
import os
from datetime import datetime, timedelta
import traceback

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'price_prediction_model.pkl')

def create_sample_dataset():
    """Create a sample dataset with consistent column names"""
    print("Creating sample dataset with consistent column structure")
    
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
        'age': np.random.randint(0, 15, n_samples)
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
    
    print(f"Created sample dataset with {len(df)} records")
    print(f"Columns: {df.columns.tolist()}")
    
    return df

def load_or_train_model():
    """Load the model if it exists, otherwise train a new one"""
    try:
        models_dir = os.path.dirname(MODEL_PATH)
        print(f"Model directory path: {models_dir}")
        
        if not os.path.exists(models_dir):
            print(f"Creating models directory: {models_dir}")
            os.makedirs(models_dir, exist_ok=True)
            
        # Create a sample dataset (always use this for consistent column names)
        df = create_sample_dataset()
            
        # Only try to load existing model if it exists and we want to use it
        # For now, let's always create a new model for consistency
        if False and os.path.exists(MODEL_PATH):
            try:
                print(f"Loading existing model from: {MODEL_PATH}")
                model_data = joblib.load(MODEL_PATH)
                return model_data
            except Exception as e:
                print(f"Error loading model: {str(e)}", file=sys.stderr)
                # Fall through to creating a new model
        
        print("Training new model...")
        
        # Select features for model training
        feature_cols = ['propertyType', 'city', 'locality', 'bedroomNum', 'furnishStatus', 'area', 'age']
        target_col = 'pricePerSqft'
        
        # Split features and target
        X = df[feature_cols]
        y = df[target_col]
        
        # Identify categorical and numerical columns
        categorical_cols = ['propertyType', 'city', 'locality']
        numerical_cols = ['bedroomNum', 'furnishStatus', 'area', 'age']
        
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
        
        # Save model and preprocessing objects
        model_data = {
            'model': model,
            'encoder': encoder,
            'scaler': scaler,
            'categorical_cols': categorical_cols,
            'numerical_cols': numerical_cols,
            'annual_growth_rate': 0.05  # 5% annual growth
        }
        
        print(f"Saving model to: {MODEL_PATH}")
        joblib.dump(model_data, MODEL_PATH)
        print("Model saved successfully")
        
        return model_data
    except Exception as e:
        print(f"Error in load_or_train_model: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

def predict_price(model_data, property_data, years=5):
    """Predict property price for the given number of years"""
    try:
        print("Making prediction with property data:")
        print(json.dumps(property_data, indent=2))
        
        model = model_data['model']
        encoder = model_data['encoder']
        scaler = model_data['scaler']
        categorical_cols = model_data['categorical_cols']
        numerical_cols = model_data['numerical_cols']
        annual_growth_rate = model_data['annual_growth_rate']
        
        # Create a DataFrame with the property data
        property_df = pd.DataFrame({
            'propertyType': [property_data['propertyType']],
            'city': [property_data['city']],
            'locality': [property_data['locality']],
            'bedroomNum': [property_data['bedroomNum'] if property_data['bedroomNum'] is not None else 0],
            'furnishStatus': [property_data['furnishStatus']],
            'area': [property_data['area']],
            'age': [0]  # Assuming new property
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
    except Exception as e:
        print(f"Error in predict_price: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {
            'error': str(e),
            'currentPricePrediction': 0,
            'currentPricePerSqft': 0,
            'futurePredictions': []
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
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()