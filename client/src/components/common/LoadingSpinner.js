import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullPage = false }) => {
  const spinnerClass = `spinner spinner-${size} ${fullPage ? 'spinner-fullpage' : ''}`;
  
  return (
    <div className={spinnerClass}>
      <div className="spinner-animation"></div>
      {fullPage && <p className="spinner-text">Loading...</p>}
    </div>
  );
};

export default LoadingSpinner;