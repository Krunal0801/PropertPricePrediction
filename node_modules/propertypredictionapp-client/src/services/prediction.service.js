import api from './api';

// Get price prediction
// export const getPricePrediction = async (propertyData) => {
//   try {
//     const response = await api.post('/predictions/price', propertyData);
//     return response.data;
//   } catch (error) {
//     console.error('Error getting price prediction:', error);
//     throw error;
//   }
// };
export const getPricePrediction = async (propertyData) => {
  try {
    const response = await api.post('/predictions/price', propertyData);
    console.log('Price Prediction Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting price prediction:', error);
    throw error;
  }
};

// Get property recommendations
export const getRecommendations = async () => {
  try {
    const response = await api.get('/predictions/recommendations');
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

// Get price trends
export const getPriceTrends = async (city, propertyType, period = 5) => {
  try {
    const response = await api.get('/predictions/trends', {
      params: { city, propertyType, period }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting price trends:', error);
    throw error;
  }
};

// Get property analysis
export const getPropertyAnalysis = async (propertyId) => {
  try {
    const response = await api.get(`/predictions/analysis/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting property analysis for ${propertyId}:`, error);
    throw error;
  }
};
