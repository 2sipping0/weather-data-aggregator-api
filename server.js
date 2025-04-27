const app = require('./app');
const config = require('./config/config');

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Weather Aggregator API running on port ${PORT}`);
  console.log(`Rate limit: ${config.RATE_LIMIT.MAX} requests per ${config.RATE_LIMIT.WINDOW_MINUTES} minutes`);
  console.log(`Cache TTL: ${config.CACHE_TTL} seconds`);
});