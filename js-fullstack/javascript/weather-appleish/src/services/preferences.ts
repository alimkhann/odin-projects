export type Preferences = {
  units: "metric" | "imperial";
  savedLocationIds: number[];
  selectedLocationId?: number;
};

const STORAGE_KEY = "weather-appleish:preferences";

const DEFAULT_PREFERENCES: Preferences = {
  units: "metric",
  savedLocationIds: [],
  selectedLocationId: undefined,
};

export function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(stored);

    // Merge with defaults to handle missing fields
    return {
      units: parsed.units === "imperial" ? "imperial" : "metric",
      savedLocationIds: Array.isArray(parsed.savedLocationIds)
        ? parsed.savedLocationIds
        : [],
      selectedLocationId:
        typeof parsed.selectedLocationId === "number"
          ? parsed.selectedLocationId
          : undefined,
    };
  } catch (error) {
    console.warn("Failed to load preferences, using defaults", error);
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(preferences: Preferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Failed to save preferences", error);
  }
}
