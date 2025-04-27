//Combines data from multiple weather providers into a unified response
 const openWeather = require('./weatherProviders/openWeather');
const weatherApi = require('./weatherProviders/weatherApi');
const weatherBit = require('./weatherProviders/weatherBit');

/**
 * Get current weather data from multiple providers
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Object} options - Additional options
 * @returns {Object} - Combined weather data
 */
const getCurrentWeather = async (lat, lon, options = {}) => {
  try {
    // Specify which providers to use, default to all
    const providers = options.providers || ['openweather', 'weatherapi', 'weatherbit'];
    const results = { 
      sources: [],
      location: {
        lat,
        lon
      },
      timestamp: new Date().toISOString()
    };
    
    // Call each provider in parallel
    const promises = [];
    
    if (providers.includes('openweather')) {
      promises.push(openWeather.getCurrentWeather(lat, lon, options.units)
        .then(data => {
          results.sources.push(data);
          // Update location name if available
          if (data.location && data.location.name) {
            results.location.name = data.location.name;
            results.location.country = data.location.country;
          }
          return data;
        }).catch(err => console.error('OpenWeather error:', err.message)));
    }
    
    if (providers.includes('weatherapi')) {
      promises.push(weatherApi.getCurrentWeather(lat, lon)
        .then(data => {
          results.sources.push(data);
          // Update location name if available
          if (data.location && data.location.name) {
            results.location.name = data.location.name;
            results.location.country = data.location.country;
          }
          return data;
        }).catch(err => console.error('WeatherAPI error:', err.message)));
    }
    
    if (providers.includes('weatherbit')) {
      promises.push(weatherBit.getCurrentWeather(lat, lon)
        .then(data => {
          results.sources.push(data);
          // Update location name if available
          if (data.location && data.location.name) {
            results.location.name = data.location.name;
            results.location.country = data.location.country;
          }
          return data;
        }).catch(err => console.error('WeatherBit error:', err.message)));
    }
    
    // Wait for all available results
    await Promise.allSettled(promises);
    
    if (results.sources.length === 0) {
      throw new Error('No weather data available from any provider');
    }
    
    // Calculate aggregated values for numeric properties
    results.aggregated = aggregateWeatherData(results.sources);
    
    return results;
  } catch (error) {
    throw error;
  }
};

/**
 * Get forecast data from multiple providers
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days to forecast
 * @param {Object} options - Additional options
 * @returns {Object} - Combined forecast data
 */
const getForecast = async (lat, lon, days = 5, options = {}) => {
  try {
    const providers = options.providers || ['openweather', 'weatherapi', 'weatherbit'];
    const results = { 
      sources: [], 
      daily: [],
      location: {
        lat,
        lon
      },
      timestamp: new Date().toISOString()
    };
    
    // Call each provider in parallel
    const promises = [];
    
    if (providers.includes('openweather')) {
      promises.push(openWeather.getForecast(lat, lon, days, options.units)
        .then(data => {
          results.sources.push({
            provider: 'openweather',
            data
          });
          
          // Update location name if available from the first item
          if (data.length > 0 && data[0].location) {
            results.location.name = data[0].location.name;
            results.location.country = data[0].location.country;
          }
          
          return data;
        }).catch(err => console.error('OpenWeather forecast error:', err.message)));
    }
    
    if (providers.includes('weatherapi')) {
      promises.push(weatherApi.getForecast(lat, lon, days)
        .then(data => {
          results.sources.push({
            provider: 'weatherapi',
            data
          });
          
          // Update location name if available from the first item
          if (data.length > 0 && data[0].location) {
            results.location.name = data[0].location.name;
            results.location.country = data[0].location.country;
          }
          
          return data;
        }).catch(err => console.error('WeatherAPI forecast error:', err.message)));
    }
    
    if (providers.includes('weatherbit')) {
      promises.push(weatherBit.getForecast(lat, lon, days)
        .then(data => {
          results.sources.push({
            provider: 'weatherbit',
            data
          });
          
          // Update location name if available from the first item
          if (data.length > 0 && data[0].location) {
            results.location.name = data[0].location.name;
            results.location.country = data[0].location.country;
          }
          
          return data;
        }).catch(err => console.error('WeatherBit forecast error:', err.message)));
    }
    
    // Wait for all available results
    await Promise.allSettled(promises);
    
    if (results.sources.length === 0) {
      throw new Error('No forecast data available from any provider');
    }
    
    // Process and align forecast data by day
    results.daily = aggregateForecastData(results.sources, days);
    
    return results;
  } catch (error) {
    throw error;
  }
};

/**
 * Aggregates forecast data from different providers
 * @param {Array} sources - Array of forecast data from each provider
 * @param {number} days - Number of days to include
 * @returns {Array} - Array of daily forecast objects
 */
const aggregateForecastData = (sources, days) => {
  const dailyForecasts = [];
  
  // Create a date array for the next 'days' days
  const dates = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Format as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    dates.push(formattedDate);
  }
  
  // For each date, aggregate data from all sources
  dates.forEach(date => {
    const dayData = {
      date,
      sources: [],
      aggregated: null
    };
    
    // Collect forecasts for this date from each source
    sources.forEach(source => {
      const provider = source.provider;
      const data = source.data;
      
      // Find the forecast for this date
      // This requires aligning dates which can be complex due to different time formats
      // For simplicity, we'll just match based on day offset
      const index = dates.indexOf(date);
      if (index < data.length) {
        dayData.sources.push({
          provider,
          forecast: data[index]
        });
      }
    });
    
    // If we have sources for this day, aggregate them
    if (dayData.sources.length > 0) {
      // Extract just the forecasts for aggregation
      const forecasts = dayData.sources.map(source => source.forecast);
      dayData.aggregated = aggregateWeatherData(forecasts);
      dailyForecasts.push(dayData);
    }
  });
  
  return dailyForecasts;
};

/**
 * Helper function to aggregate weather data from multiple sources
 * @param {Array} sources - Array of weather data from different providers
 * @returns {Object} - Aggregated weather data
 */
const aggregateWeatherData = (sources) => {
  // For numeric values, calculate average
  // For text values like descriptions, use the most common one
  
  if (sources.length === 0) return null;
  if (sources.length === 1) return sources[0].current;
  
  const result = {
    temp: 0,
    feels_like: 0,
    humidity: 0,
    pressure: 0,
    wind_speed: 0,
    wind_direction: 0,
    descriptions: {},
    conditions: {}
  };
  
  // Count occurrences of text values
  sources.forEach(source => {
    const current = source.current;
    
    // Add numeric values for averaging
    result.temp += current.temp || 0;
    result.feels_like += current.feels_like || 0;
    result.humidity += current.humidity || 0;
    result.pressure += current.pressure || 0;
    result.wind_speed += current.wind_speed || 0;
    result.wind_direction += current.wind_direction || 0;
    
    // Count text values
    const desc = current.description?.toLowerCase();
    const cond = current.condition?.toLowerCase();
    
    if (desc) result.descriptions[desc] = (result.descriptions[desc] || 0) + 1;
    if (cond) result.conditions[cond] = (result.conditions[cond] || 0) + 1;
  });
  
  // Calculate averages for numeric values
  Object.keys(result).forEach(key => {
    if (typeof result[key] === 'number') {
      result[key] = parseFloat((result[key] / sources.length).toFixed(2));
    }
  });
  
  // Find most common text values
  result.description = findMostCommon(result.descriptions);
  result.condition = findMostCommon(result.conditions);
  delete result.descriptions;
  delete result.conditions;
  
  // Use icon from first source (could be improved)
  result.icon = sources[0].current.icon;
  
  return result;
};

/**
 * Helper function to find the most common value in an object of counts
 * @param {Object} countObj - Object with values as keys and counts as values
 * @returns {string|null} - Most common value
 */
const findMostCommon = (countObj) => {
  let maxCount = 0;
  let mostCommon = null;
  
  Object.entries(countObj).forEach(([value, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = value;
    }
  });
  
  return mostCommon;
};

module.exports = {
  getCurrentWeather,
  getForecast
};