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
};

export type HourlyPoint = {
  timeISO: string;
  temp: number;
  weatherCode: number;
};

export type DailyPoint = {
  dateISO: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  sunriseISO: string;
  sunsetISO: string;
};

export type Forecast = {
  locationId: number;
  units: Units;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
};
