import { searchLocations } from "../api/openMeteoGeocoding.ts";
import type { Location } from "../domain/weather.ts";
import { mapGeocodingResultToLocation } from "../mappers/geocodingMapper.ts";

/**
 * Request the browser's geolocation and resolve to the nearest
 * Open-Meteo Location so it has a proper id + timezone.
 *
 * Flow:
 * 1. Try `navigator.geolocation` → coords
 *    – If that fails (denied / unavailable), fall back to IP geolocation
 * 2. Free BigDataCloud reverse-geocode (no key) → city name
 * 3. Open-Meteo geocoding search by that name → pick closest result
 */
export async function detectUserLocation(): Promise<Location> {
  let latitude: number;
  let longitude: number;

  try {
    const coords = await getBrowserCoords();
    latitude = coords.latitude;
    longitude = coords.longitude;
    console.log("[geolocation] Browser coords:", latitude, longitude);
  } catch {
    console.log("[geolocation] Browser geolocation failed, trying IP lookup…");
    const ipLoc = await ipGeolocate();
    latitude = ipLoc.latitude;
    longitude = ipLoc.longitude;
    console.log("[geolocation] IP coords:", latitude, longitude);
  }

  const cityName = await reverseGeocode(latitude, longitude);
  if (!cityName) throw new Error("Could not determine city from coordinates");

  const results = await searchLocations(cityName);
  if (results.length === 0)
    throw new Error(`No Open-Meteo results for "${cityName}"`);

  // Pick the result closest to the detected coordinates
  const closest = results
    .map((r) => ({
      result: r,
      dist: haversine(latitude, longitude, r.latitude, r.longitude),
    }))
    .sort((a, b) => a.dist - b.dist)[0];

  return mapGeocodingResultToLocation(closest.result);
}

/* ── Helpers ──────────────────────────────────────────── */

function getBrowserCoords(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => {
        const reasons: Record<number, string> = {
          1: "PERMISSION_DENIED – user denied or OS blocked location access",
          2: "POSITION_UNAVAILABLE – location info unavailable",
          3: "TIMEOUT – request timed out",
        };
        console.warn(
          "[geolocation]",
          reasons[err.code] ?? `Unknown error (${err.code})`,
          err.message,
        );
        reject(err);
      },
      { enableHighAccuracy: false, timeout: 5_000, maximumAge: 300_000 },
    );
  });
}

type IpApiResponse = {
  latitude?: number;
  longitude?: number;
  city?: string;
};

/** Free IP-based geolocation (no API key needed). */
async function ipGeolocate(): Promise<{ latitude: number; longitude: number }> {
  // Try ip-api.com first (free, no key, reliable CORS headers)
  try {
    const res = await fetch("http://ip-api.com/json/?fields=lat,lon");
    if (res.ok) {
      const data = (await res.json()) as { lat?: number; lon?: number };
      if (data.lat != null && data.lon != null) {
        return { latitude: data.lat, longitude: data.lon };
      }
    }
  } catch {
    /* fall through */
  }

  // Fallback: ipapi.co (HTTPS, free, ~1000 req/day)
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = (await res.json()) as IpApiResponse;
      if (data.latitude != null && data.longitude != null) {
        return { latitude: data.latitude, longitude: data.longitude };
      }
    }
  } catch {
    /* fall through */
  }

  throw new Error("All IP geolocation providers failed");
}

type ReverseGeocodeResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
};

async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | undefined> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) return undefined;
  const data = (await res.json()) as ReverseGeocodeResponse;
  return data.city || data.locality || data.principalSubdivision || undefined;
}

/** Haversine distance in km (good enough for sorting). */
function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
