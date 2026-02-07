import type { Forecast, Location, Units } from "../domain/weather.ts";

export const FORECAST_KEY_PREFIX = "weather-appleish:forecast";

export function forecastKey(locationId: number, units: Units): string {
  return `${FORECAST_KEY_PREFIX}:${locationId}:${units}`;
}

export type ModalType =
  | "hourly"
  | "forecast"
  | "uv"
  | "sun"
  | "wind"
  | "humidity"
  | "visibility"
  | "pressure"
  | "precipitation"
  | "feelslike";

export type Theme = "light" | "dark";

export type AppState = {
  prefs: {
    units: Units;
    savedLocationIds: number[];
    selectedLocationId?: number;
    theme: Theme;
  };

  entities: {
    locationsById: Record<number, Location>;
    forecastsByKey: Record<string, Forecast>;
  };

  search: {
    query: string;
    results: number[];
    loading: boolean;
    error?: string;
  };

  ui: {
    sidebarCollapsed: boolean;
    loadingForecast: boolean;
    activeModal?: ModalType;
    toast?: { kind: "error" | "info"; message: string };
  };
};
