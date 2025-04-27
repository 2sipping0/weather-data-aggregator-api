require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  
  // Cache settings
  CACHE_TTL: parseInt(process.env.CACHE_TTL || 1800), // Default: 30 minutes
  
  // Rate limiting settings
  RATE_LIMIT: {
    WINDOW_MINUTES: parseInt(process.env.RATE_LIMIT_WINDOW || 15),
    MAX: parseInt(process.env.RATE_LIMIT_MAX || 100)
  },
  
  // Weather API configurations
  WEATHER_APIS: {
    OPENWEATHER: {
      API_KEY: process.env.OPENWEATHER_API_KEY,
      BASE_URL: 'https://api.openweathermap.org/data/2.5',
      GEO_URL: 'https://api.openweathermap.org/geo/1.0'
    },
    WEATHERAPI: {
      API_KEY: process.env.WEATHERAPI_API_KEY,
      BASE_URL: 'https://api.weatherapi.com/v1'
    },
    WEATHERBIT: {
      API_KEY: process.env.WEATHERBIT_API_KEY,
      BASE_URL: 'https://api.weatherbit.io/v2.0'
    }
  }
};