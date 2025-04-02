#!/usr/bin/env python3
# server/python/recommendation.py

import sys
import json
import os
from collections import Counter

def analyze_search_history(search_history):
    """Analyze search history to identify user preferences"""
    preferences = {
        'cities': Counter(),
        'propertyTypes': Counter(),
        'bedrooms': Counter(),
        'locations': Counter(),
        'priceRanges': [],
        'areaRanges': []
    }
    
    # Process each search query
    for query in search_history:
        if not query:
            continue
            
        # Extract features from each search query
        if query.get('city'):
            preferences['cities'][query['city']] += 1
        
        if query.get('propertyType'):
            preferences['propertyTypes'][query['propertyType']] += 1
        
        if query.get('bedroomNum'):
            preferences['bedrooms'][query['bedroomNum']] += 1
        
        if query.get('location'):
            preferences['locations'][query['location']] += 1
        
        # Track price ranges
        min_price = query.get('minPrice')
        max_price = query.get('maxPrice')
        if min_price or max_price:
            preferences['priceRanges'].append({
                'min': min_price if min_price else 0,
                'max': max_price if max_price else float('inf')
            })
        
        # Track area ranges
        min_area = query.get('minArea')
        max_area = query.get('maxArea')
        if min_area or max_area:
            preferences['areaRanges'].append({
                'min': min_area if min_area else 0,
                'max': max_area if max_area else float('inf')
            })
    
    return preferences

def generate_recommendation_queries(preferences):
    """Generate recommendation queries based on user preferences"""
    recommendation_queries = []
    
    # Get top preferences
    top_cities = [city for city, count in preferences['cities'].most_common(2)]
    top_property_types = [prop_type for prop_type, count in preferences['propertyTypes'].most_common(2)]
    top_bedrooms = [bedroom for bedroom, count in preferences['bedrooms'].most_common(2)]
    top_locations = [location for location, count in preferences['locations'].most_common(3)]
    
    # Calculate average price range
    avg_min_price = 0
    avg_max_price = float('inf')
    
    if preferences['priceRanges']:
        min_prices = [price_range['min'] for price_range in preferences['priceRanges'] if price_range['min']]
        max_prices = [price_range['max'] for price_range in preferences['priceRanges'] if price_range['max'] != float('inf')]
        
        if min_prices:
            avg_min_price = sum(min_prices) / len(min_prices)
        
        if max_prices:
            avg_max_price = sum(max_prices) / len(max_prices)
    
    # Generate primary recommendation query based on most common preferences
    if top_cities and top_property_types:
        primary_query = {
            'city': top_cities[0],
            'propertyType': top_property_types[0]
        }
        
        if top_bedrooms:
            primary_query['bedroomNum'] = top_bedrooms[0]
        
        if top_locations:
            primary_query['location'] = top_locations[0]
        
        if avg_min_price > 0:
            primary_query['minPrice'] = int(avg_min_price)
        
        if avg_max_price < float('inf'):
            primary_query['maxPrice'] = int(avg_max_price)
        
        recommendation_queries.append(primary_query)
    
    # Generate alternative queries with variations
    if len(top_cities) > 1:
        # Different city, same property type
        alt_query = primary_query.copy() if 'primary_query' in locals() else {}
        alt_query['city'] = top_cities[1]
        recommendation_queries.append(alt_query)
    
    if len(top_property_types) > 1:
        # Same city, different property type
        alt_query = primary_query.copy() if 'primary_query' in locals() else {}
        alt_query['propertyType'] = top_property_types[1]
        recommendation_queries.append(alt_query)
    
    if len(top_bedrooms) > 1:
        # Same criteria, different bedroom count
        alt_query = primary_query.copy() if 'primary_query' in locals() else {}
        alt_query['bedroomNum'] = top_bedrooms[1]
        recommendation_queries.append(alt_query)
    
    # If no clear preferences, add a generic query
    if not recommendation_queries:
        recommendation_queries.append({
            'propertyType': 'Residential Apartment'
        })
    
    return recommendation_queries

def main():
    """Main function to execute the script"""
    if len(sys.argv) != 2:
        print("Usage: python recommendation.py <input_json_file>", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        # Read input JSON file
        with open(input_file, 'r') as f:
            input_data = json.load(f)
        
        search_history = input_data.get('searchHistory', [])
        
        # Analyze search history
        preferences = analyze_search_history(search_history)
        
        # Generate recommendation queries
        recommendation_queries = generate_recommendation_queries(preferences)
        
        # Output result as JSON
        result = {
            'preferences': {
                'topCities': [city for city, _ in preferences['cities'].most_common(3)],
                'topPropertyTypes': [prop_type for prop_type, _ in preferences['propertyTypes'].most_common(3)],
                'topBedrooms': [bedroom for bedroom, _ in preferences['bedrooms'].most_common(3)],
                'topLocations': [location for location, _ in preferences['locations'].most_common(3)]
            },
            'queries': recommendation_queries
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()