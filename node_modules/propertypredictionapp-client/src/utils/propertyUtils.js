
// Get property image URL or placeholder if not available
export const getPropertyImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${property.images[0]}`;
    }
    
    return 'https://via.placeholder.com/300x200?text=No+Image+Available';
  };
  
  // Get property type display name
  export const getPropertyTypeDisplay = (propertyType) => {
    const typeMap = {
      'Residential Apartment': 'Apartment',
      'Independent House/Villa': 'Villa',
      'Farm House': 'Farm House',
      'Residential Land': 'Land',
      'Studio Apartment': 'Studio',
      'Independent/Builder Floor': 'Builder Floor',
      'Serviced Apartments': 'Serviced Apartment'
    };
    
    return typeMap[propertyType] || propertyType;
  };
  
  // Get furnish status display name
  export const getFurnishStatusDisplay = (furnishStatus) => {
    const statusMap = {
      0: 'Unfurnished',
      1: 'Furnished',
      2: 'Semi-Furnished'
    };
    
    return statusMap[furnishStatus] || 'Unknown';
  };
  
  // Get facing direction display name
  export const getFacingDirectionDisplay = (facingCode) => {
    const facingMap = {
      1: 'North',
      2: 'South',
      3: 'East',
      4: 'West',
      5: 'North-East',
      6: 'North-West',
      7: 'South-East',
      8: 'South-West'
    };
    
    return facingMap[facingCode] || 'Unknown';
  };
  
  // Calculate EMI for a given loan amount, interest rate, and tenure
  export const calculateEMI = (loanAmount, interestRate, tenureInYears) => {
    // Convert annual interest rate to monthly and in decimal
    const monthlyInterestRate = (interestRate / 12) / 100;
    
    // Tenure in months
    const tenureInMonths = tenureInYears * 12;
    
    // Calculate EMI using formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = loanAmount * monthlyInterestRate * 
      Math.pow(1 + monthlyInterestRate, tenureInMonths) / 
      (Math.pow(1 + monthlyInterestRate, tenureInMonths) - 1);
    
    return emi;
  };