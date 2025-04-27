const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MINUTES * 60 * 1000, // Convert minutes to milliseconds
  max: config.RATE_LIMIT.MAX, // Maximum number of requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: `You have exceeded the ${config.RATE_LIMIT.MAX} requests in ${config.RATE_LIMIT.WINDOW_MINUTES} minutes limit!`,
  },
  
  // Store implementation - default is memory, but you could use Redis for production
  // store: new RedisStore({
  //   client: redisClient,
  //   prefix: 'rate-limit:',
  //   windowMs: config.RATE_LIMIT.WINDOW_MINUTES * 60 * 1000,
  // }),
});

module.exports = limiter;