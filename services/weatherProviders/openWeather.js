const axios = require('axios');
const config = require('../../config/config');
const { transformOpenWeatherData } = require('../../utils/dataTransformer');

const API_CONFIG = config.WEATHER_APIS.OPENWEATHER;

/**
 * Get current weather data from OpenWeatherMap
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Units system (metric, imperial, standard)
 * @returns {Promise<Object>} - Transformed weather data
 */
const getCurrentWeather = async (lat, lon, units = 'metric') => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_CONFIG.API_KEY,
        units
      },
      timeout: 5000 // 5 second timeout
    });
    
    return transformOpenWeatherData(response.data);
  } catch (error) {
    console.error('Error fetching data from OpenWeather:', error.message);
    
    // Add more context to the error
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.message || error.message;
      
      throw new Error(`OpenWeather API error (${status}): ${message}`);
    }
    
    throw error;
  }
};

/**
 * Get forecast data from OpenWeatherMap
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days (ignored for OpenWeather as their free API provides 5 days)
 * @param {string} units - Units system (metric, imperial, standard)
 * @returns {Promise<Array>} - Array of transformed forecast data
 */
const getForecast = async (lat, lon, days = 5, units = 'metric') => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_CONFIG.API_KEY,
        units
      },
      timeout: 5000 // 5 second timeout
    });
    
    // OpenWeather returns forecast in 3-hour steps
    // Group by day to create a daily forecast
    const forecastByDay = {};
    
    response.data.list.forEach(item => {
      // Extract date part only
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!forecastByDay[date]) {
        forecastByDay[date] = [];
      }
      
      forecastByDay[date].push(transformOpenWeatherData(item));
    });
    
    // Combine daily forecasts (using mid-day forecast as representative)
    const dailyForecasts = Object.keys(forecastByDay).slice(0, days).map(date => {
      const dayForecasts = forecastByDay[date];
      
      // Choose the mid-day forecast if available (around noon)
      let selectedForecast = dayForecasts[Math.floor(dayForecasts.length / 2)];
      
      // Find forecast closest to noon
      const noonTarget = new Date(`${date}T12:00:00Z`).getTime();
      let closestToDiff = Infinity;
      
      dayForecasts.forEach(forecast => {
        const forecastTime = new Date(forecast.timestamp).getTime();
        const diff = Math.abs(forecastTime - noonTarget);
        
        if (diff < closestToDiff) {
          closestToDiff = diff;
          selectedForecast = forecast;
        }
      });
      
      // Add the date to the forecast object
      selectedForecast.date = date;
      
      return selectedForecast;
    });
    
    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching forecast from OpenWeather:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data.message || error.message;
      
      throw new Error(`OpenWeather forecast API error (${status}): ${message}`);
    }
    
    throw error;
  }
};

module.exports = {
  getCurrentWeather,
  getForecast
};