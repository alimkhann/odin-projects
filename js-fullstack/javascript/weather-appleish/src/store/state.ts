import type { Forecast, Location, Units } from "../domain/weather.ts";

export const FORECAST_KEY_PREFIX = "weather-appleish:forecast";

export function forecastKey(locationId: number, units: Units): string {
  return `${FORECAST_KEY_PREFIX}:${locationId}:${units}`;
}

export type AppState = {
  prefs: {
    units: Units;
    savedLocationIds: number[];
    selectedLocationId?: number;
  };

  entities: {
    locationsById: Record<number, Location>;
    forecastsByKey: Record<string, Forecast>;
  };

  search: {
    query: string;
    results: number[]; // locationIds
    loading: boolean;
    error?: string;
  };

  ui: {
    sidebarCollapsed: boolean;
    loadingForecast: boolean;
    activePanel?:
      | "wind"
      | "uv"
      | "sun"
      | "humidity"
      | "visibility"
      | "pressure"
      | "daily"
      | "hourly";
    toast?: { kind: "error" | "info"; message: string };
  };
};
