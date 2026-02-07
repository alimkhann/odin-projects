import type { Location } from "../domain/weather.ts";

export type Preferences = {
  units: "metric" | "imperial";
  savedLocationIds: number[];
  selectedLocationId?: number;
  theme: "light" | "dark";
  savedLocations?: Record<number, Location>;
  sidebarCollapsed?: boolean;
};

const STORAGE_KEY = "weather-appleish:preferences";

const DEFAULT_PREFERENCES: Preferences = {
  units: "metric",
  savedLocationIds: [],
  selectedLocationId: undefined,
  theme: "light",
};

export function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(stored);

    return {
      units: parsed.units === "imperial" ? "imperial" : "metric",
      savedLocationIds: Array.isArray(parsed.savedLocationIds)
        ? parsed.savedLocationIds.filter((x: unknown) => typeof x === "number")
        : [],
      selectedLocationId:
        typeof parsed.selectedLocationId === "number"
          ? parsed.selectedLocationId
          : undefined,
      theme: parsed.theme === "dark" ? "dark" : "light",
      savedLocations:
        parsed.savedLocations && typeof parsed.savedLocations === "object"
          ? (parsed.savedLocations as Record<number, Location>)
          : {},
      sidebarCollapsed: parsed.sidebarCollapsed === true,
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
