import React from 'react';
import { formatPrice } from '../../utils/format';
import './PropertyPriceChart.css';

const PropertyPriceChart = ({ data, currentPrice }) => {
  // If data is not available, show a message
  if (!data || data.length === 0) {
    return (
      <div className="no-chart-data">
        <p>Price forecast data is not available.</p>
      </div>
    );
  }
  
  // Find the maximum price for scaling
  const maxPrice = Math.max(
    currentPrice,
    ...data.map(item => item.projectedPrice)
  );
  
  // Get the percentage height based on price
  const getHeightPercentage = (price) => {
    return (price / maxPrice) * 100;
  };
  
  return (
    <div className="price-chart">
      <div className="price-chart-bars">
        <div className="chart-bar current-bar">
          <div 
            className="bar-fill"
            style={{ height: `${getHeightPercentage(currentPrice)}%` }}
          ></div>
          <div className="bar-label current-label">Current</div>
          <div className="bar-price">{formatPrice(currentPrice)}</div>
        </div>
        
        {data.map((item, index) => (
          <div className="chart-bar forecast-bar" key={index}>
            <div 
              className="bar-fill"
              style={{ height: `${getHeightPercentage(item.projectedPrice)}%` }}
            ></div>
            <div className="bar-label">{item.year}</div>
            <div className="bar-price">{formatPrice(item.projectedPrice)}</div>
          </div>
        ))}
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color current-color"></div>
          <div className="legend-label">Current Price</div>
        </div>
        <div className="legend-item">
          <div className="legend-color forecast-color"></div>
          <div className="legend-label">Projected Price</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPriceChart;