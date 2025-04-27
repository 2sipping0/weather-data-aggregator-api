const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const weatherRoutes = require('./routes/weather');
const errorHandler = require('./utils/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply rate limiter to all routes
app.use(rateLimiter);

// API info route
app.get('/', (req, res) => {
  res.json({
    name: 'Weather Aggregator API',
    version: '1.0.0',
    endpoints: {
      current: '/api/weather/current?lat={latitude}&lon={longitude}',
      forecast: '/api/weather/forecast?lat={latitude}&lon={longitude}&days={days}',
      byCity: '/api/weather/city/{cityName}',
      byZipCode: '/api/weather/zip/{zipCode},{countryCode}'
    }
  });
});

// Weather routes
app.use('/api/weather', weatherRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    message: 'The requested resource does not exist'
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;