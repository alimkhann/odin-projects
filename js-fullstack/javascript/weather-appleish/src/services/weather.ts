import { fetchForecast } from "../api/openMeteoForecast.ts";
import type { Forecast, Location, Units } from "../domain/weather.ts";
import { mapOpenMeteoForecast } from "../mappers/openMeteoMapper.ts";
import { forecastKey } from "../store/state.ts";
import { TtlCache } from "./cache.ts";

const FORECAST_TTL_MS = 1000 * 60 * 10;

const memCache = new TtlCache<Forecast>();

type Persisted<T> = { expiresAt: number; value: T };

function readPersistedForecastCache(key: string): Forecast | undefined {
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;

  try {
    const parsed: Persisted<Forecast> = JSON.parse(raw);
    if (typeof parsed.expiresAt !== "number") return undefined;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return undefined;
    }
    return parsed.value;
  } catch {
    return undefined;
  }
}

function writePersistedForecastCache(
  key: string,
  value: Forecast,
  ttlMs: number,
): void {
  const entry: Persisted<Forecast> = { expiresAt: Date.now() + ttlMs, value };
  localStorage.setItem(key, JSON.stringify(entry));
}

export async function getForecast(
  location: Location,
  units: Units,
  opts?: { signal?: AbortSignal },
): Promise<Forecast> {
  const key = forecastKey(location.id, units);

  const cached = memCache.get(key);
  if (cached) {
    console.log("[weatherService] MEM cache hit:", key);
    return cached;
  }

  const persisted = readPersistedForecastCache(key);
  if (persisted) {
    console.log("[weatherService] STORAGE cache hit:", key);
    memCache.set(key, persisted, FORECAST_TTL_MS);
    return persisted;
  }

  try {
    console.log("[weatherService] NETWORK fetch:", key);
    const raw = await fetchForecast(
      location.latitude,
      location.longitude,
      location.timezone || "auto",
      units,
      opts?.signal,
    );

    const mapped = mapOpenMeteoForecast(raw, {
      locationId: location.id,
      units,
    });

    memCache.set(key, mapped, FORECAST_TTL_MS);
    writePersistedForecastCache(key, mapped, FORECAST_TTL_MS);

    return mapped;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new Error(
      `Failed to get forecast for ${location.name}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
