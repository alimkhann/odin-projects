import type { Forecast, Units } from "../domain/weather.ts";
import type { OpenMeteoForecastResponse } from "./openMeteoTypes.ts";

function zipLength(...arrays: Array<readonly unknown[] | undefined>) {
  const lengths = arrays
    .filter(Boolean)
    .map((arr) => (arr as unknown[]).length);
  return lengths.length ? Math.min(...lengths) : 0;
}

export function mapOpenMeteoForecast(
  raw: OpenMeteoForecastResponse,
  ctx: { locationId: number; units: Units },
): Forecast {
  if (!raw.current) throw new Error("Open-Meteo: missing current weather data");
  if (!raw.hourly) throw new Error("Open-Meteo: missing hourly weather data");
  if (!raw.daily) throw new Error("Open-Meteo: missing daily weather data");

  const hourly = raw.hourly;
  const daily = raw.daily;

  const currentCode = raw.current.weather_code ?? raw.current.weathercode ?? 0;

  const hourlyCodes = hourly.weather_code ?? hourly.weathercode ?? [];

  const hourlyLength = zipLength(
    hourly.time,
    hourly.temperature_2m,
    hourlyCodes,
  );
  const dailyLength = zipLength(
    daily.time,
    daily.temperature_2m_max,
    daily.temperature_2m_min,
    daily.weather_code,
    daily.sunrise,
    daily.sunset,
  );

  return {
    locationId: ctx.locationId,
    units: ctx.units,
    current: {
      timeISO: raw.current.time,
      temp: raw.current.temperature_2m,
      feelsLike: raw.current.apparent_temperature,
      weatherCode: currentCode,
    },
    hourly: Array.from({ length: hourlyLength }, (_, i) => ({
      timeISO: hourly.time[i],
      temp: hourly.temperature_2m[i],
      weatherCode: hourlyCodes[i] ?? 0,
    })),
    daily: Array.from({ length: dailyLength }, (_, i) => ({
      dateISO: daily.time[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      weatherCode: daily.weather_code[i] ?? 0,
      sunriseISO: daily.sunrise[i],
      sunsetISO: daily.sunset[i],
    })),
  };
}
