#!/usr/bin/env python3
# server/python/property_analysis.py

import sys
import json
import pandas as pd
import numpy as np
import os
from scipy import stats

def load_data():
    """Load the dataset for comparison"""
    # In a real application, you'd load the CSV file here
    # For this example, we'll create a dummy dataset if file doesn't exist
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
        'MIN_AREA_SQFT': np.random.uniform(400, 2000, 150),
        'PRICE': np.random.uniform(5000000, 50000000, 150),
        'PRICE_PER_UNIT_AREA': np.random.uniform(10000, 30000, 150)
    }
    
    return pd.DataFrame(data)

def analyze_property(property_data, df):
    """Analyze the property in comparison to similar properties"""
    # Extract property info
    property_type = property_data['propertyType']
    city = property_data['city']
    locality = property_data['locality']
    bedrooms = property_data['bedroomNum']
    area = property_data['area']
    price = property_data['price']
    price_per_sqft = property_data['pricePerSqft']
    
    # Filter similar properties
    similar_properties = df[
        (df['PROPERTY_TYPE'] == property_type) &
        (df['CITY'] == city) &
        (df['BEDROOM_NUM'] == bedrooms)
    ].copy()
    
    # Further filter by locality if enough properties
    locality_properties = similar_properties[
        similar_properties['location.LOCALITY_NAME'] == locality
    ].copy()
    
    if len(locality_properties) >= 5:
        comparison_df = locality_properties
        comparison_level = 'Locality'
    else:
        comparison_df = similar_properties
        comparison_level = 'City'
    
    # Calculate statistics
    avg_price = comparison_df['PRICE'].mean()
    avg_price_per_sqft = comparison_df['PRICE_PER_UNIT_AREA'].mean()
    median_price = comparison_df['PRICE'].median()
    median_price_per_sqft = comparison_df['PRICE_PER_UNIT_AREA'].median()
    
    # Calculate price percentile
    price_percentile = stats.percentileofscore(comparison_df['PRICE'], price)
    price_per_sqft_percentile = stats.percentileofscore(comparison_df['PRICE_PER_UNIT_AREA'], price_per_sqft)
    
    # Determine if property is fairly priced
    price_diff_pct = ((price - avg_price) / avg_price) * 100
    price_per_sqft_diff_pct = ((price_per_sqft - avg_price_per_sqft) / avg_price_per_sqft) * 100
    
    # Price evaluation
    if price_diff_pct < -10:
        price_evaluation = "Underpriced"
        investment_rating = "Good"
    elif price_diff_pct > 10:
        price_evaluation = "Overpriced"
        investment_rating = "Poor"
    else:
        price_evaluation = "Fairly priced"
        investment_rating = "Fair"
    
    # Price trend prediction
    annual_growth_rate = 0.05  # Assume 5% annual growth
    
    # Calculate 5-year projection
    projected_values = []
    current_price = price
    current_price_per_sqft = price_per_sqft
    
    for year in range(1, 6):
        current_price *= (1 + annual_growth_rate)
        current_price_per_sqft *= (1 + annual_growth_rate)
        
        projected_values.append({
            'year': 2024 + year,
            'projectedPrice': round(current_price, 2),
            'projectedPricePerSqft': round(current_price_per_sqft, 2)
        })
    
    # Area comparison
    avg_area = comparison_df['MIN_AREA_SQFT'].mean()
    area_diff_pct = ((area - avg_area) / avg_area) * 100
    
    # Generate analysis result
    analysis_result = {
        'marketComparison': {
            'comparisonLevel': comparison_level,
            'similarProperties': len(comparison_df),
            'avgPrice': round(avg_price, 2),
            'medianPrice': round(median_price, 2),
            'avgPricePerSqft': round(avg_price_per_sqft, 2),
            'medianPricePerSqft': round(median_price_per_sqft, 2),
            'pricePercentile': round(price_percentile, 1),
            'pricePerSqftPercentile': round(price_per_sqft_percentile, 1),
            'priceDifference': round(price_diff_pct, 1),
            'pricePerSqftDifference': round(price_per_sqft_diff_pct, 1)
        },
        'evaluation': {
            'priceEvaluation': price_evaluation,
            'investmentRating': investment_rating,
            'comments': generate_evaluation_comments(price_diff_pct, price_per_sqft_diff_pct, area_diff_pct)
        },
        'forecast': {
            'annualGrowthRate': annual_growth_rate * 100,
            'projectedValues': projected_values
        }
    }
    
    return analysis_result

def generate_evaluation_comments(price_diff_pct, price_per_sqft_diff_pct, area_diff_pct):
    """Generate comments based on the property evaluation"""
    comments = []
    
    # Price comments
    if price_diff_pct < -10:
        comments.append("The property is priced below market average, potentially offering good value.")
    elif price_diff_pct > 10:
        comments.append("The property is priced above market average. Consider negotiating the price.")
    else:
        comments.append("The property is priced in line with market rates.")
    
    # Price per sqft comments
    if price_per_sqft_diff_pct < -10:
        comments.append("The price per square foot is lower than average, indicating potential value.")
    elif price_per_sqft_diff_pct > 10:
        comments.append("The price per square foot is higher than average. Verify if premium features justify this.")
    
    # Area comments
    if area_diff_pct > 10:
        comments.append("The property is larger than average, which could increase resale value.")
    elif area_diff_pct < -10:
        comments.append("The property is smaller than average. Consider if the space meets your needs.")
    
    return comments

def main():
    """Main function to execute the script"""
    if len(sys.argv) != 2:
        print("Usage: python property_analysis.py <input_json_file>", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        # Read input JSON file
        with open(input_file, 'r') as f:
            property_data = json.load(f)
        
        # Load data for comparison
        df = load_data()
        
        # Analyze the property
        analysis = analyze_property(property_data, df)
        
        # Output result as JSON
        print(json.dumps(analysis))
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()