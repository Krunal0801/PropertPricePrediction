// components/prediction/HotspotImpactDisplay.js
import React from 'react';
import { formatPrice } from '../../utils/format';
import './HotspotImpactDisplay.css';

const HotspotImpactDisplay = ({ pois, priceImpacts, basePrice }) => {
  if (!pois || pois.length === 0) {
    return null;
  }

  // Group POIs by category
  const poiCategories = {
    'transit_station': { 
      label: 'Transit Stations', 
      icon: 'fas fa-train',
      priceImpact: 0.12,
      description: 'Proximity to transit stations typically increases property value due to improved connectivity.'
    },
    'metro_station': { 
      label: 'Metro Stations', 
      icon: 'fas fa-subway',
      priceImpact: 0.15,
      description: 'Metro connectivity is highly valued and can significantly boost property prices.'
    },
    'railway_station': { 
      label: 'Railway Stations', 
      icon: 'fas fa-train',
      priceImpact: 0.10,
      description: 'Railway stations provide important transit connections but may have noise concerns.'
    },
    'school': { 
      label: 'Schools', 
      icon: 'fas fa-school',
      priceImpact: 0.08,
      description: 'Good schools nearby increase demand, especially from families with children.'
    },
    'college': { 
      label: 'Colleges', 
      icon: 'fas fa-graduation-cap',
      priceImpact: 0.05,
      description: 'Higher education institutions can create rental demand and boost property values.'
    },
    'shopping_mall': { 
      label: 'Shopping Malls', 
      icon: 'fas fa-shopping-bag',
      priceImpact: 0.07,
      description: 'Shopping malls offer convenience and entertainment options, boosting property appeal.'
    },
    'supermarket': { 
      label: 'Supermarkets', 
      icon: 'fas fa-shopping-cart',
      priceImpact: 0.04,
      description: 'Supermarkets provide essential conveniences for daily living.'
    },
    'hospital': { 
      label: 'Hospitals', 
      icon: 'fas fa-hospital',
      priceImpact: 0.06,
      description: 'Healthcare access is an important amenity for property valuation.'
    },
    'park': { 
      label: 'Parks', 
      icon: 'fas fa-tree',
      priceImpact: 0.05,
      description: 'Green spaces enhance quality of life and property values.'
    }
  };

  // Categorize POIs and calculate distance-based impact
  const categorizedPOIs = {};
  pois.forEach(poi => {
    const type = poi.types[0];
    if (!categorizedPOIs[type]) {
      categorizedPOIs[type] = [];
    }
    categorizedPOIs[type].push(poi);
  });

  // Calculate price impact for each POI based on distance
  const poiWithImpacts = [];
  Object.entries(categorizedPOIs).forEach(([category, categoryPOIs]) => {
    if (poiCategories[category]) {
      categoryPOIs.forEach(poi => {
        // Calculate impact based on distance (closer = higher impact)
        // Impact decreases exponentially with distance
        const distanceFactor = Math.max(0, 1 - (poi.distance / 2));
        const baseImpact = poiCategories[category].priceImpact;
        const impact = baseImpact * distanceFactor;
        
        poiWithImpacts.push({
          ...poi,
          category,
          impact,
          valueImpact: basePrice * impact
        });
      });
    }
  });

  // Get top impacts to display
  const topImpacts = poiWithImpacts
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);

  // Calculate total impact percentage
  const totalImpact = poiWithImpacts.reduce((sum, poi) => sum + poi.impact, 0);
  // Cap total impact at a reasonable percentage (e.g., 25%)
  const cappedTotalImpact = Math.min(totalImpact, 0.25);
  const totalValueImpact = basePrice * cappedTotalImpact;

  return (
    <div className="hotspot-impact-container">
      <h3>Hotspot Impact Analysis</h3>
      <p className="impact-description">
        These points of interest within 2km of your selected location affect the property's value. 
        The price impact is calculated based on proximity and importance.
      </p>
      
      <div className="total-impact">
        <div className="impact-header">
          <div className="impact-title">Total Hotspot Value Impact</div>
          <div className="impact-value positive">{formatPrice(totalValueImpact)}</div>
        </div>
        <div className="impact-percentage">
          +{(cappedTotalImpact * 100).toFixed(1)}% of base value
        </div>
        <div className="impact-bar-container">
          <div className="impact-bar" style={{ width: `${cappedTotalImpact * 100 * 4}%` }}></div>
        </div>
      </div>
      
      <div className="top-impacts">
        <h4>Top Value-Adding Hotspots</h4>
        {topImpacts.map((poi, index) => (
          <div className="hotspot-impact-item" key={index}>
            <div className="impact-icon">
              <i className={poiCategories[poi.category]?.icon || "fas fa-map-marker-alt"}></i>
            </div>
            <div className="impact-info">
              <div className="impact-name">{poi.name}</div>
              <div className="impact-detail">
                <span className="impact-type">{poiCategories[poi.category]?.label || poi.category}</span>
                <span className="impact-distance">{poi.distance.toFixed(1)} km away</span>
              </div>
            </div>
            <div className="impact-effect">
              <div className="impact-amount positive">+{formatPrice(poi.valueImpact)}</div>
              <div className="impact-percent">+{(poi.impact * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="impact-notes">
        <h4>How Hotspots Affect Property Value</h4>
        <ul className="notes-list">
          <li>
            <i className="fas fa-subway"></i>
            <span><strong>Transit:</strong> Properties near metro and railway stations typically command 10-15% higher prices due to improved connectivity.</span>
          </li>
          <li>
            <i className="fas fa-school"></i>
            <span><strong>Education:</strong> Proximity to quality schools and colleges can increase value by 5-8% depending on institution reputation.</span>
          </li>
          <li>
            <i className="fas fa-shopping-cart"></i>
            <span><strong>Shopping:</strong> Convenient access to shopping centers and supermarkets adds 4-7% to property values.</span>
          </li>
          <li>
            <i className="fas fa-hospital"></i>
            <span><strong>Healthcare:</strong> Nearby hospitals and clinics contribute 3-6% to value based on facility quality and proximity.</span>
          </li>
          <li>
            <i className="fas fa-tree"></i>
            <span><strong>Recreation:</strong> Parks and green spaces can add 3-5% to property values and improve long-term appreciation.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HotspotImpactDisplay;