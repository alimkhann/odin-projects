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
    current: "temperature_2m,apparent_temperature,weathercode",
    hourly: "temperature_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset",
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
