import type { Units } from "../domain/weather.ts";

export async function fetchForecast(
  lat: number,
  lon: number,
  timezone: string,
  units: Units,
  signal?: AbortSignal,
) {
  const params: Record<string, string> = {
    latitude: String(lat),
    longitude: String(lon),
    timezone,
    forecast_days: "10",
    current: [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
      "relative_humidity_2m",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "precipitation",
      "is_day",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
      "relative_humidity_2m",
      "dew_point_2m",
      "visibility",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "precipitation",
      "precipitation_probability",
      "uv_index",
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "weather_code",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "wind_direction_10m_dominant",
    ].join(","),
  };

  if (units === "imperial") {
    params.temperature_unit = "fahrenheit";
    params.wind_speed_unit = "mph";
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams(params).toString();

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Forecast failed: ${res.status}`);
  return res.json();
}
