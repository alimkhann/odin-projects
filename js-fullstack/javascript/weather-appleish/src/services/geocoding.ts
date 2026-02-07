import { searchLocations as searchLocationsApi } from "../api/openMeteoGeocoding.ts";
import type { Location } from "../domain/weather.ts";
import { mapGeocodingResultToLocation } from "../mappers/geocodingMapper.ts";
import { TtlCache } from "./cache.ts";

const SEARCH_TTL_MS = 5 * 60 * 1000;
const memCache = new TtlCache<Location[]>();

function keyForQuery(query: string): string {
  return query.trim().toLowerCase();
}

export async function searchLocations(
  query: string,
  opts?: { signal?: AbortSignal },
): Promise<Location[]> {
  const q = keyForQuery(query);
  if (q.length < 2) return [];

  const cached = memCache.get(q);
  if (cached) {
    console.log("[geocodingService] MEM cache hit:", q);
    return cached;
  }

  console.log("[geocodingService] NETWORK fetch:", q);
  const results = await searchLocationsApi(query, opts?.signal);
  const mapped = results.map(mapGeocodingResultToLocation);

  memCache.set(q, mapped, SEARCH_TTL_MS);
  return mapped;
}
