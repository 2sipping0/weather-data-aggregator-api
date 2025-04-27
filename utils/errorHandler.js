/**
 * Global Error Handler
 * Provides consistent error response format for the API
 */

/**
 * Express error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = (err, req, res, next) => {
    // Log the error for debugging
    console.error('Error:', err);
    
    // Determine appropriate status code
    let statusCode = 500;
    let message = 'Server error';
    let details = null;
    
    // Handle different types of errors
    if (err.response) {
      // Error from external API
      statusCode = err.response.status || 500;
      message = `External API error: ${err.message}`;
      details = {
        provider: err.response.config?.url || 'unknown',
        response: err.response.data
      };
    } else if (err.message.includes('No locations found')) {
      statusCode = 404;
      message = err.message;
    } else if (err.message.includes('Missing required parameters')) {
      statusCode = 400;
      message = err.message;
    } else if (err.message.includes('No weather data available') || 
               err.message.includes('No forecast data available')) {
      statusCode = 503;
      message = 'Weather data services unavailable';
      details = { cause: err.message };
    } else if (err.code === 'ECONNABORTED') {
      statusCode = 504;
      message = 'Request to weather provider timed out';
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      statusCode = 503;
      message = 'Weather provider service unavailable';
    }
    
    // Send response to client
    const errorResponse = {
      status: statusCode,
      error: message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    };
    
    // Add details for non-production environments
    if (process.env.NODE_ENV !== 'production' && details) {
      errorResponse.details = details;
    }
    
    res.status(statusCode).json(errorResponse);
  };