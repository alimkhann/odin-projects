import { loadPreferences, savePreferences } from "./services/preferences.ts";

export async function runPlayground() {
  const initial = loadPreferences();
  console.log("Initial preferences:", initial);

  const updated = {
    units: "imperial" as const,
    savedLocationIds: [123, 456, 789],
    selectedLocationId: 456,
  };

  savePreferences(updated);
  console.log("Saved preferences:", updated);

  const loaded = loadPreferences();
  console.log("Loaded preferences:", loaded);
  console.log("Match:", JSON.stringify(loaded) === JSON.stringify(updated));
}
