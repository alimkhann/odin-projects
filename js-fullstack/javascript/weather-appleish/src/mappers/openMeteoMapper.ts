import type { Forecast, Units } from "../domain/weather.ts";
import type { OpenMeteoForecastResponse } from "./openMeteoTypes.ts";

function zipLength(...arrays: Array<readonly unknown[] | undefined>) {
  const lengths = arrays
    .filter(Boolean)
    .map((arr) => (arr as unknown[]).length);
  return lengths.length ? Math.min(...lengths) : 0;
}

function safeNum(v: number | undefined | null, fallback = 0): number {
  return v != null && Number.isFinite(v) ? v : fallback;
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
      humidity: safeNum(raw.current.relative_humidity_2m),
      pressure: safeNum(raw.current.surface_pressure),
      windSpeed: safeNum(raw.current.wind_speed_10m),
      windDirection: safeNum(raw.current.wind_direction_10m),
      windGusts: safeNum(raw.current.wind_gusts_10m),
      precipitation: safeNum(raw.current.precipitation),
      isDay: (raw.current.is_day ?? 1) === 1,
    },
    hourly: Array.from({ length: hourlyLength }, (_, i) => ({
      timeISO: hourly.time[i],
      temp: hourly.temperature_2m[i],
      feelsLike: safeNum(hourly.apparent_temperature?.[i]),
      weatherCode: hourlyCodes[i] ?? 0,
      humidity: safeNum(hourly.relative_humidity_2m?.[i]),
      dewPoint: safeNum(hourly.dew_point_2m?.[i]),
      visibility: safeNum(hourly.visibility?.[i]),
      pressure: safeNum(hourly.surface_pressure?.[i]),
      windSpeed: safeNum(hourly.wind_speed_10m?.[i]),
      windDirection: safeNum(hourly.wind_direction_10m?.[i]),
      windGusts: safeNum(hourly.wind_gusts_10m?.[i]),
      precipitation: safeNum(hourly.precipitation?.[i]),
      precipitationProbability: safeNum(hourly.precipitation_probability?.[i]),
      uvIndex: safeNum(hourly.uv_index?.[i]),
    })),
    daily: Array.from({ length: dailyLength }, (_, i) => ({
      dateISO: daily.time[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      weatherCode: daily.weather_code[i] ?? 0,
      sunriseISO: daily.sunrise[i],
      sunsetISO: daily.sunset[i],
      uvIndexMax: safeNum(daily.uv_index_max?.[i]),
      precipitationSum: safeNum(daily.precipitation_sum?.[i]),
      precipitationProbabilityMax: safeNum(
        daily.precipitation_probability_max?.[i],
      ),
      windSpeedMax: safeNum(daily.wind_speed_10m_max?.[i]),
      windGustsMax: safeNum(daily.wind_gusts_10m_max?.[i]),
      dominantWindDirection: safeNum(daily.wind_direction_10m_dominant?.[i]),
    })),
  };
}
