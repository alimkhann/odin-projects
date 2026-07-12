export type Units = "metric" | "imperial";

export type Location = {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type CurrentWeather = {
  timeISO: string;
  temp: number;
  feelsLike: number;
  weatherCode: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  precipitation: number;
  isDay: boolean;
};

export type HourlyPoint = {
  timeISO: string;
  temp: number;
  feelsLike: number;
  weatherCode: number;
  humidity: number;
  dewPoint: number;
  visibility: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  precipitation: number;
  precipitationProbability: number;
  uvIndex: number;
};

export type DailyPoint = {
  dateISO: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  sunriseISO: string;
  sunsetISO: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  dominantWindDirection: number;
};

export type Forecast = {
  locationId: number;
  units: Units;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
};
