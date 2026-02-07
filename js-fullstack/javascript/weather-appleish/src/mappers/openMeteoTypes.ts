export type OpenMeteoForecastResponse = {
  current?: {
    time: string;
    interval: number;
    temperature_2m: number;
    apparent_temperature: number;
    weathercode?: number;
    weather_code?: number;
    relative_humidity_2m: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    precipitation: number;
    is_day: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    weathercode?: number[];
    weather_code?: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    visibility: number[];
    surface_pressure: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    uv_index: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
};
