
 const NodeCache = require('node-cache');
const config = require('../config/config');

// Create cache instance with configuration from config
const cache = new NodeCache({ 
  stdTTL: config.CACHE_TTL, 
  checkperiod: config.CACHE_TTL * 0.2, // Check for expired items at 20% of TTL
  useClones: false // Don't clone objects (better performance)
});

/**
 * Middleware that checks if the requested data is in cache
 * If found, returns cached data
 * If not, adds functionality to cache the response
 */
const cacheMiddleware = (req, res, next) => {
  // Create a unique cache key based on the request URL and query parameters
  const key = req.originalUrl;
  
  // Check if the data exists in the cache
  const cachedData = cache.get(key);
  
  if (cachedData) {
    console.log(`Cache hit for ${key}`);
    // Add a header to indicate the response came from cache
    res.set('X-Data-Source', 'cache');
    return res.status(200).json(cachedData);
  }
  
  // If not in cache, attach a function to the response to cache the result
  res.cacheData = (data) => {
    console.log(`Caching data for ${key}`);
    cache.set(key, data);
  };
  
  console.log(`Cache miss for ${key}`);
  next();
};

/**
 * Function to manually invalidate cache
 * @param {string} key - The cache key to invalidate (optional)
 */
const invalidateCache = (key) => {
  if (key) {
    // Invalidate a specific key
    console.log(`Invalidating cache for ${key}`);
    cache.del(key);
  } else {
    // Invalidate all cache
    console.log('Flushing entire cache');
    cache.flushAll();
  }
};

// Get cache statistics
const getCacheStats = () => {
  return {
    keys: cache.keys(),
    stats: cache.getStats(),
    hits: cache.stats.hits,
    misses: cache.stats.misses,
    hitRate: cache.stats.hits / (cache.stats.hits + cache.stats.misses || 1)
  };
};

module.exports = { 
  cacheMiddleware, 
  invalidateCache, 
  getCacheStats,
  cache
};