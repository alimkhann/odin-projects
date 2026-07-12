export type GeocodingResult = {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export async function searchLocations(query: string, signal?: AbortSignal) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: query,
    count: "10",
    language: "en",
    format: "json",
  }).toString();

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const json = (await res.json()) as { results?: GeocodingResult[] };
  return json.results ?? [];
}
