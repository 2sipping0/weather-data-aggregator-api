const axios = require('axios');
const config = require('../config/config');

/**
 * Get coordinates for a city name
 * @param {string} cityName - Name of the city
 * @param {string} countryCode - Two-letter country code (optional)
 * @returns {Promise<Array>} - Array of location objects with coordinates
 */
const getCoordinatesByCity = async (cityName, countryCode = '') => {
  try {
    // Format query parameter
    let query = cityName;
    if (countryCode) {
      query += `,${countryCode}`;
    }
    
    // Use OpenWeatherMap's geocoding API
    const response = await axios.get(`${config.WEATHER_APIS.OPENWEATHER.GEO_URL}/direct`, {
      params: {
        q: query,
        limit: 5,
        appid: config.WEATHER_APIS.OPENWEATHER.API_KEY
      }
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error(`No locations found for city: ${cityName}`);
    }
    
    // Transform the response to a standardized format
    return response.data.map(location => ({
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country,
      state: location.state || null
    }));
  } catch (error) {
    if (error.response) {
      throw new Error(`Geocoding API error: ${error.response.data.message || error.message}`);
    }
    throw error;
  }
};

/**
 * Get coordinates for a zip/postal code
 * @param {string} zipCode - Zip or postal code
 * @param {string} countryCode - Two-letter country code (default: US)
 * @returns {Promise<Object>} - Location object with coordinates
 */
const getCoordinatesByZip = async (zipCode, countryCode = 'US') => {
  try {
    // Use OpenWeatherMap's zip code geocoding API
    const response = await axios.get(`${config.WEATHER_APIS.OPENWEATHER.GEO_URL}/zip`, {
      params: {
        zip: `${zipCode},${countryCode}`,
        appid: config.WEATHER_APIS.OPENWEATHER.API_KEY
      }
    });
    
    if (!response.data) {
      throw new Error(`No location found for zip code: ${zipCode}`);
    }
    
    // Return in a standardized format
    return {
      name: response.data.name,
      lat: response.data.lat,
      lon: response.data.lon,
      country: response.data.country,
      zip: zipCode
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Geocoding API error: ${error.response.data.message || error.message}`);
    }
    throw error;
  }
};

/**
 * Alternate implementation using WeatherAPI's search API
 * This could be used as a fallback if the OpenWeatherMap geocoding fails
 */
const getCoordinatesByCity_Alternate = async (cityName) => {
  try {
    const response = await axios.get(`${config.WEATHER_APIS.WEATHERAPI.BASE_URL}/search.json`, {
      params: {
        key: config.WEATHER_APIS.WEATHERAPI.API_KEY,
        q: cityName
      }
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error(`No locations found for city: ${cityName}`);
    }
    
    return response.data.map(location => ({
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country,
      region: location.region || null
    }));
  } catch (error) {
    if (error.response) {
      throw new Error(`WeatherAPI geocoding error: ${error.response.data.error?.message || error.message}`);
    }
    throw error;
  }
};

module.exports = {
  getCoordinatesByCity,
  getCoordinatesByZip,
  getCoordinatesByCity_Alternate
};