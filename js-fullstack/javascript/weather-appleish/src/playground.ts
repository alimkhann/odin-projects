import { searchLocations } from "./api/openMeteoGeocoding.ts";
import { mapGeocodingResultToLocation } from "./mappers/geocodingMapper.ts";
import { getForecast } from "./services/weather.ts";

export async function runPlayground() {
  try {
    // Clear old cache entries from previous runs
    localStorage.clear();
    console.log("Cleared localStorage\n");

    // Get a test location
    const results = await searchLocations("London");
    const first = results[0];
    if (!first) {
      console.error("No location found");
      return;
    }

    const location = mapGeocodingResultToLocation(first);

    console.log("=== Cache Test (3s TTL) ===");
    console.log("Location:", location.name);

    // First call → should fetch (check Network tab)
    console.log("\n1️⃣ First call (should fetch):");
    const forecast1 = await getForecast(location, "metric");
    console.log("Got forecast, temp:", forecast1.current.temp);

    // Second call immediately → should use mem cache (no network request)
    console.log("\n2️⃣ Second call immediately (mem cache):");
    const forecast2 = await getForecast(location, "metric");
    console.log("Got forecast, temp:", forecast2.current.temp);

    // Wait 3.5 seconds → should expire, fetch again
    console.log("\n3️⃣ Waiting 3.5 seconds for cache to expire...");
    await new Promise((resolve) => setTimeout(resolve, 3500));

    console.log("Calling again (should fetch):");
    const forecast3 = await getForecast(location, "metric");
    console.log("Got forecast, temp:", forecast3.current.temp);

    console.log("\n✅ Check Network tab to see request patterns!");
  } catch (err) {
    console.error("Error:", err);
  }
}
