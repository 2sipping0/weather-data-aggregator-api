const axios = require('axios');
const config = require('../../config/config');
const { transformWeatherBitData } = require('../../utils/dataTransformer');

const API_CONFIG = config.WEATHER_APIS.WEATHERBIT;

/**
 * Get current weather data from Weatherbit
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Units system (M for metric, I for imperial, S for scientific)
 * @returns {Promise<Object>} - Transformed weather data
 */
const getCurrentWeather = async (lat, lon, units = 'M') => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/current`, {
      params: {
        lat,
        lon,
        key: API_CONFIG.API_KEY,
        units
      },
      timeout: 5000 // 5 second timeout
    });
    
    // Weatherbit returns data in an array, even for current weather
    if (!response.data.data || response.data.data.length === 0) {
      throw new Error('No weather data returned from Weatherbit');
    }
    
    return transformWeatherBitData(response.data);
  } catch (error) {
    console.error('Error fetching data from Weatherbit:', error.message);
    
    // Add more context to the error
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.error || error.message;
      
      throw new Error(`Weatherbit API error (${status}): ${message}`);
    }
    
    throw error;
  }
};

/**
 * Get forecast data from Weatherbit
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days (1-16)
 * @param {string} units - Units system (M for metric, I for imperial, S for scientific)
 * @returns {Promise<Array>} - Array of transformed forecast data
 */
const getForecast = async (lat, lon, days = 5, units = 'M') => {
  try {
    // Ensure days is within allowed range for the API
    const validDays = Math.min(Math.max(days, 1), 16);
    
    const response = await axios.get(`${API_CONFIG.BASE_URL}/forecast/daily`, {
      params: {
        lat,
        lon,
        key: API_CONFIG.API_KEY,
        days: validDays,
        units
      },
      timeout: 5000 // 5 second timeout
    });
    
    if (!response.data.data || response.data.data.length === 0) {
      throw new Error('No forecast data returned from Weatherbit');
    }
    
    // Transform each day's forecast data
    const dailyForecasts = response.data.data.map(dayData => {
      // Create a data structure that matches the expected input format
      const forecastData = {
        data: [dayData],
        city_name: response.data.city_name,
        country_code: response.data.country_code,
        lat,
        lon
      };
      
      // Transform using our standard transformer
      const transformedData = transformWeatherBitData(forecastData);
      
      // Add the date from the forecast data
      transformedData.date = dayData.valid_date;
      
      return transformedData;
    });
    
    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching forecast from Weatherbit:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.error || error.message;
      
      throw new Error(`Weatherbit forecast API error (${status}): ${message}`);
    }
    
    throw error;
  }
};

module.exports = {
  getCurrentWeather,
  getForecast
};