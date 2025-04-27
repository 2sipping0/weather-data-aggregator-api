/**
 * Data Transformer Utilities
 * Transforms responses from different weather APIs into a standardized format
 */

/**
 * Transform OpenWeather data to our standard format
 * @param {Object} data - Original API response data
 * @returns {Object} - Standardized weather data
 */
const transformOpenWeatherData = (data) => {
    return {
      provider: 'openweather',
      timestamp: new Date(data.dt * 1000).toISOString(),
      location: {
        name: data.name || 'Unknown',
        country: data.sys?.country || '',
        lat: data.coord?.lat,
        lon: data.coord?.lon
      },
      current: {
        temp: data.main?.temp,
        feels_like: data.main?.feels_like,
        humidity: data.main?.humidity,
        pressure: data.main?.pressure,
        wind_speed: data.wind?.speed,
        wind_direction: data.wind?.deg,
        description: data.weather?.[0]?.description,
        condition: data.weather?.[0]?.main,
        icon: data.weather?.[0]?.icon,
        clouds: data.clouds?.all,
        uv_index: data.uvi || 0,
        visibility: data.visibility,
        rain_1h: data.rain?.['1h'] || 0,
        snow_1h: data.snow?.['1h'] || 0
      }
    };
  };
  
  /**
   * Transform WeatherAPI data to our standard format
   * @param {Object} data - Original API response data
   * @returns {Object} - Standardized weather data
   */
  const transformWeatherApiData = (data) => {
    const current = data.current;
    const location = data.location;
    
    return {
      provider: 'weatherapi',
      timestamp: current.last_updated_epoch 
        ? new Date(current.last_updated_epoch * 1000).toISOString() 
        : new Date().toISOString(),
      location: {
        name: location?.name || 'Unknown',
        country: location?.country || '',
        lat: location?.lat,
        lon: location?.lon,
        region: location?.region
      },
      current: {
        temp: current.temp_c,
        feels_like: current.feelslike_c,
        humidity: current.humidity,
        pressure: current.pressure_mb,
        wind_speed: current.wind_kph,
        wind_direction: current.wind_degree,
        description: current.condition?.text,
        condition: current.condition?.text,
        icon: current.condition?.icon,
        clouds: current.cloud,
        uv_index: current.uv,
        visibility: current.vis_km,
        rain_1h: current.precip_mm || 0,
        is_day: current.is_day === 1
      }
    };
  };
  
  /**
   * Transform Weatherbit data to our standard format
   * @param {Object} data - Original API response data
   * @returns {Object} - Standardized weather data
   */
  const transformWeatherBitData = (data) => {
    // Weatherbit returns current conditions in data.data[0]
    const current = data.data[0];
    
    return {
      provider: 'weatherbit',
      timestamp: current.ts ? new Date(current.ts * 1000).toISOString() : new Date().toISOString(),
      location: {
        name: data.city_name || 'Unknown',
        country: data.country_code || '',
        lat: data.lat,
        lon: data.lon,
        state: data.state_code
      },
      current: {
        temp: current.temp,
        feels_like: current.app_temp,
        humidity: current.rh,
        pressure: current.pres,
        wind_speed: current.wind_spd * 3.6, // Convert m/s to km/h for consistency
        wind_direction: current.wind_dir,
        description: current.weather?.description,
        condition: current.weather?.description,
        icon: current.weather?.icon,
        clouds: current.clouds,
        uv_index: current.uv,
        visibility: current.vis,
        rain_1h: current.precip || 0,
        snow_1h: current.snow || 0,
        aqi: current.aqi
      }
    };
  };
  
  module.exports = {
    transformOpenWeatherData,
    transformWeatherApiData,
    transformWeatherBitData
  };
