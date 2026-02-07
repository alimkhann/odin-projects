export type OpenMeteoForecastResponse = {
  current?: {
    time: string;
    interval: number;
    temperature_2m: number;
    apparent_temperature: number;
    weathercode?: number; // old
    weather_code?: number; // new
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weathercode?: number[];
    weather_code?: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    sunrise: string[];
    sunset: string[];
  };
};
