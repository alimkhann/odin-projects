import { searchLocations } from "./api/openMeteoGeocoding.ts";
import { mapGeocodingResultToLocation } from "./mappers/geocodingMapper.ts";
import { getForecast } from "./services/weather.ts";

export async function runPlayground() {
  try {
    // Clear old cache entries from previous runs
    localStorage.clear();
    console.log("Cleared localStorage\n");

    console.log("\n=== AbortController Test ===");

    const resultsA = await searchLocations("London");
    const locA = mapGeocodingResultToLocation(resultsA[0]);

    const resultsB = await searchLocations("Paris");
    const locB = mapGeocodingResultToLocation(resultsB[0]);

    let controller: AbortController | null = null;

    async function requestForecast(label: string, location: typeof locA) {
      controller?.abort(); // cancel previous request
      controller = new AbortController(); // new request token

      try {
        console.log(`[${label}] start`);
        const fc = await getForecast(location, "metric", {
          signal: controller.signal,
        });
        console.log(`[${label}] done`, location.name, fc.current.temp);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log(`[${label}] aborted`);
          return;
        }
        console.error(`[${label}] failed`, err);
      }
    }

    // Fire two requests quickly:
    requestForecast("A", locA);
    setTimeout(() => requestForecast("B", locB), 50);
  } catch (err) {
    console.error("Error:", err);
  }
}
