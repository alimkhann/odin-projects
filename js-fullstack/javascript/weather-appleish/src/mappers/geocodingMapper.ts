import type { GeocodingResult } from "../api/openMeteoGeocoding.ts";
import type { Location } from "../domain/weather.ts";

export function mapGeocodingResultToLocation(
  result: GeocodingResult,
): Location {
  return {
    id: result.id,
    name: result.name,
    country: result.country,
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone ?? "auto",
  };
}
