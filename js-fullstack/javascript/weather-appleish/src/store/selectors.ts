import type { AppState } from "./state.ts";
import { forecastKey } from "./state.ts";

export const selectUnits = (state: AppState) => state.prefs.units;

export const selectSavedLocations = (state: AppState) =>
  state.prefs.savedLocationIds
    .map((id) => state.entities.locationsById[id])
    .filter(Boolean);

export const selectSelectedLocation = (state: AppState) => {
  const id = state.prefs.selectedLocationId;
  return id ? state.entities.locationsById[id] : undefined;
};

export const selectForecastForSelectedLocation = (state: AppState) => {
  const location = selectSelectedLocation(state);
  if (!location) return undefined;

  const key = forecastKey(location.id, state.prefs.units);
  return state.entities.forecastsByKey[key];
};

export const selectSearchResults = (state: AppState) =>
  state.search.results
    .map((id) => state.entities.locationsById[id])
    .filter(Boolean);
