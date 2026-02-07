import { searchLocations } from "./services/geocoding.ts";

export async function runPlayground() {
  try {
    localStorage.clear();
    console.log("=== Geocoding Cache Test ===");

    console.log("\n1️⃣ First call (should fetch):");
    const first = await searchLocations("Lon");
    console.log("Results:", first.length);

    console.log("\n2️⃣ Second call (should be cache hit):");
    const second = await searchLocations("Lon");
    console.log("Results:", second.length);
  } catch (err) {
    console.error("Error:", err);
  }
}
