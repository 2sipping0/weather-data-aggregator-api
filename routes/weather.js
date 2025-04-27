/**
 * Weather API Routes
 * Defines endpoints for accessing weather data
 */
const express = require('express');
const router = express.Router();
const aggregator = require('../services/aggregator');
const geolocation = require('../services/geolocation');
const { cacheMiddleware, invalidateCache, getCacheStats } = require('../middleware/cache');

/**
 * Get current weather by coordinates
 * @route GET /api/weather/current
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Units system (metric, imperial)
 * @param {string} providers - Comma-separated list of providers to use
 */
router.get('/current', cacheMiddleware, async (req, res, next) => {
  try {
    const { lat, lon, units, providers } = req.query;
    
    // Validate required parameters
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon' 
      });
    }
    
    // Parse provider list if provided
    const providerList = providers ? providers.split(',') : undefined;
    
    const weather = await aggregator.getCurrentWeather(
      parseFloat(lat),
      parseFloat(lon),
      { units, providers: providerList }
    );
    
    // Cache the successful response
    if (res.cacheData) {
      res.cacheData(weather);
    }
    
    res.json(weather);
  } catch (error) {
    next(error);
  }
});

/**
 * Get weather forecast by coordinates
 * @route GET /api/weather/forecast
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days (1-10)
 * @param {string} units - Units system (metric, imperial)
 * @param {string} providers - Comma-separated list of providers to use
 */
router.get('/forecast', cacheMiddleware, async (req, res, next) => {
  try {
    const { lat, lon, days, units, providers } = req.query;
    
    // Validate required parameters
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon' 
      });
    }
    
    // Parse provider list if provided
    const providerList = providers ? providers.split(',') : undefined;
    
    const forecast = await aggregator.getForecast(
      parseFloat(lat),
      parseFloat(lon),
      days ? parseInt(days) : 5,
      { units, providers: providerList }
    );
    
    // Cache the successful response
    if (res.cacheData) {
      res.cacheData(forecast);
    }
    
    res.json(forecast);
  } catch (error) {
    next(error);
  }
});

/**
 * Get weather by city name
 * @route GET /api/weather/city/:cityName
 * @param {string} cityName - Name of the city
 * @param {string} country - Two-letter country code (optional)
 */
router.get('/city/:cityName', cacheMiddleware, async (req, res, next) => {
  try {
    const { cityName } = req.params;
    const { country, units, providers, days, forecast } = req.query;
    
    // Get coordinates for the city
    const locations = await geolocation.getCoordinatesByCity(cityName, country);
    
    // Use the first (most relevant) result
    const location = locations[0];
    
    // Parse provider list if provided
    const providerList = providers ? providers.split(',') : undefined;
    
    let result;
    
    // Determine if we need current weather or forecast
    if (forecast === 'true' || days) {
      result = await aggregator.getForecast(
        location.lat,
        location.lon,
        days ? parseInt(days) : 5,
        { units, providers: providerList }
      );
    } else {
      result = await aggregator.getCurrentWeather(
        location.lat,
        location.lon,
        { units, providers: providerList }
      );
    }
    
    // Add the location data to the result
    result.location = {
      ...result.location,
      name: location.name,
      country: location.country,
      state: location.state
    };
    
    // Cache the successful response
    if (res.cacheData) {
      res.cacheData(result);
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get weather by zip/postal code
 * @route GET /api/weather/zip/:zipCode
 * @param {string} zipCode - Zip or postal code
 * @param {string} country - Two-letter country code (default: US)
 */
router.get('/zip/:zipCode', cacheMiddleware, async (req, res, next) => {
  try {
    const { zipCode } = req.params;
    const { country, units, providers, days, forecast } = req.query;
    
    // Get coordinates for the zip code
    const location = await geolocation.getCoordinatesByZip(zipCode, country || 'US');
    
    // Parse provider list if provided
    const providerList = providers ? providers.split(',') : undefined;
    
    let result;
    
    // Determine if we need current weather or forecast
    if (forecast === 'true' || days) {
      result = await aggregator.getForecast(
        location.lat,
        location.lon,
        days ? parseInt(days) : 5,
        { units, providers: providerList }
      );
    } else {
      result = await aggregator.getCurrentWeather(
        location.lat,
        location.lon,
        { units, providers: providerList }
      );
    }
    
    // Add the location data to the result
    result.location = {
      ...result.location,
      name: location.name,
      country: location.country,
      zip: zipCode
    };
    
    // Cache the successful response
    if (res.cacheData) {
      res.cacheData(result);
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Utility endpoint for cache management (could be restricted to admin users)
 * @route GET /api/weather/cache/stats
 */
router.get('/cache/stats', (req, res) => {
  res.json(getCacheStats());
});

/**
 * Clear all or specific cache entries (could be restricted to admin users)
 * @route DELETE /api/weather/cache
 * @param {string} key - Specific cache key to invalidate (optional)
 */
router.delete('/cache', (req, res) => {
  const { key } = req.query;
  
  invalidateCache(key);
  
  res.json({
    message: key ? `Cache for ${key} invalidated` : 'All cache invalidated',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;