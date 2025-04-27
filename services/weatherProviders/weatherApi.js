const axios = require('axios');
const config = require('../../config/config');
const { transformWeatherApiData } = require('../../utils/dataTransformer');

const API_CONFIG = config.WEATHER_APIS.WEATHERAPI;

/**
 * Get current weather data from WeatherAPI
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Transformed weather data
 */
const getCurrentWeather = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/current.json`, {
      params: {
        key: API_CONFIG.API_KEY,
        q: `${lat},${lon}`
      },
      timeout: 5000 // 5 second timeout
    });
    
    return transformWeatherApiData(response.data);
  } catch (error) {
    console.error('Error fetching data from WeatherAPI:', error.message);
    
    // Add more context to the error
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.error?.message || error.message;
      
      throw new Error(`WeatherAPI error (${status}): ${message}`);
    }
    
    throw error;
  }
};

/**
 * Get forecast data from WeatherAPI
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days to forecast (1-10)
 * @returns {Promise<Array>} - Array of transformed forecast data
 */
const getForecast = async (lat, lon, days = 5) => {
  try {
    // Ensure days is within allowed range for the API
    const validDays = Math.min(Math.max(days, 1), 10);
    
    const response = await axios.get(`${API_CONFIG.BASE_URL}/forecast.json`, {
      params: {
        key: API_CONFIG.API_KEY,
        q: `${lat},${lon}`,
        days: validDays,
        aqi: 'no',
        alerts: 'no'
      },
      timeout: 5000 // 5 second timeout
    });
    
    // Transform the forecast data into our standard format
    const dailyForecasts = response.data.forecast.forecastday.map(day => {
      // Create a modified data structure that matches our transformer's expected input
      const forecastData = {
        location: response.data.location,
        current: {
          // Use day.day as the current data for this forecast day
          ...day.day,
          // Add additional fields our transformer expects
          last_updated_epoch: new Date(day.date).getTime() / 1000,
          condition: day.day.condition
        }
      };
      
      // Transform using our standard transformer
      const transformedData = transformWeatherApiData(forecastData);
      
      // Add the date to the forecast
      transformedData.date = day.date;
      
      return transformedData;
    });
    
    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching forecast from WeatherAPI:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.error?.message || error.message;
      
      throw new Error(`WeatherAPI forecast error (${status}): ${message}`);
    }
    
    throw error;
  }
};

module.exports = {
  getCurrentWeather,
  getForecast
};