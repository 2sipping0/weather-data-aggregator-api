# Weather Data Aggregator API

A unified API service that aggregates weather data from multiple free weather APIs, providing a single consistent interface with enhanced features such as caching, rate limiting, and geolocation.

## Features

- **Data Aggregation**: Combines data from multiple weather sources (OpenWeatherMap, WeatherAPI.com, and Weatherbit)
- **Unified API**: Provides a clean, consistent interface for all weather data
- **Performance Caching**: Reduces latency and minimizes calls to external APIs
- **Rate Limiting**: Protects the API from abuse and ensures fair usage
- **Geolocation Services**: Supports querying by city name or zip/postal code
- **Error Handling**: Graceful error handling and consistent error responses
- **Fallback Mechanism**: If one provider fails, data is still available from others

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/2sipping0/weather-data-aggregator.git
   cd weather-aggregator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env` file:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file to add your API keys for each weather provider:
   - Get an [OpenWeatherMap API key](https://openweathermap.org/api)
   - Get a [WeatherAPI.com API key](https://www.weatherapi.com/)
   - Get a [Weatherbit API key](https://www.weatherbit.io/)

## Usage

### Starting the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

### API Endpoints

#### Current Weather

By coordinates:
```
GET /api/weather/current?lat=40.7128&lon=-74.0060
```

By city name:
```
GET /api/weather/city/New%20York
```

By zip/postal code:
```
GET /api/weather/zip/10001
```

#### Weather Forecast

By coordinates:
```
GET /api/weather/forecast?lat=40.7128&lon=-74.0060&days=5
```

By city name:
```
GET /api/weather/city/London?forecast=true&days=3
```

By zip/postal code:
```
GET /api/weather/zip/90210?forecast=true&days=7
```

### Query Parameters

- `lat`, `lon`: Geographic coordinates (required for coordinate-based endpoints)
- `units`: Units system (`metric` [default], `imperial`)
- `providers`: Comma-separated list of providers to use (`openweather`, `weatherapi`, `weatherbit`)
- `days`: Number of days for forecast (1-10)
- `country`: Two-letter country code for city or zip code queries
- `forecast`: Set to `true` to get forecast instead of current weather for city/zip endpoints

### Cache Management

Get cache statistics:
```
GET /api/weather/cache/stats
```

Clear entire cache:
```
DELETE /api/weather/cache
```

Clear specific cache entry:
```
DELETE /api/weather/cache?key=/api/weather/current?lat=40.7128&lon=-74.0060
```

## Example Response

```json
{
  "sources": [
    {
      "provider": "openweather",
      "timestamp": "2023-11-17T14:30:00.000Z",
      "location": {
        "name": "New York",
        "country": "US",
        "lat": 40.7128,
        "lon": -74.006
      },
      "current": {
        "temp": 8.5,
        "feels_like": 5.2,
        "humidity": 62,
        "pressure": 1018,
        "wind_speed": 4.1,
        "wind_direction": 320,
        "description": "scattered clouds",
        "condition": "Clouds",
        "icon": "03d"
      }
    },
    {
      "provider": "weatherapi",
      "timestamp": "2023-11-17T14:15:00.000Z",
      "location": {
        "name": "New York",
        "country": "United States of America",
        "lat": 40.71,
        "lon": -74.01
      },
      "current": {
        "temp": 9.1,
        "feels_like": 6.3,
        "humidity": 58,
        "pressure": 1019,
        "wind_speed": 3.9,
        "wind_direction": 315,
        "description": "Partly cloudy",
        "condition": "Partly cloudy",
        "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png"
      }
    }
  ],
  "location": {
    "lat": 40.7128,
    "lon": -74.006,
    "name": "New York",
    "country": "US"
  },
  "timestamp": "2023-11-17T14:45:00.000Z",
  "aggregated": {
    "temp": 8.8,
    "feels_like": 5.75,
    "humidity": 60,
    "pressure": 1018.5,
    "wind_speed": 4.0,
    "wind_direction": 317.5,
    "description": "scattered clouds",
    "condition": "partly cloudy",
    "icon": "03d"
  }
}
```

## Error Handling

All errors are returned with appropriate HTTP status codes and consistent JSON format:

```json
{
  "status": 404,
  "error": "No locations found for city: NonExistentCity",
  "timestamp": "2023-11-17T14:45:00.000Z",
  "path": "/api/weather/city/NonExistentCity"
}
```

## Rate Limiting

The API includes rate limiting to prevent abuse. By default, it allows 100 requests per 15-minute window from each IP address. This can be configured in the `.env` file.

When the rate limit is exceeded, the API returns a 429 status code:

```json
{
  "status": 429,
  "error": "Too Many Requests",
  "message": "You have exceeded the 100 requests in 15 minutes limit!",
  "timestamp": "2023-11-17T14:45:00.000Z"
}
```

## License

MIT

## Credits

This project uses data from:
- [OpenWeatherMap](https://openweathermap.org/)
- [WeatherAPI.com](https://www.weatherapi.com/)
- [Weatherbit](https://www.weatherbit.io/)

Each service has its own terms of use and data attribution requirements.# weather-data-aggregator-api
