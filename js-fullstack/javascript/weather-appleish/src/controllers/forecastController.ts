import type { Location, Units } from "../domain/weather.ts";
import { savePreferences } from "../services/preferencesService.ts";
import { getForecast } from "../services/weatherService.ts";
import type { AppState } from "../store/state.ts";
import { forecastKey } from "../store/state.ts";

type Store = {
  getState: () => AppState;
  setState: (updater: (previousState: AppState) => AppState) => void;
};

export function createForecastController(store: Store) {
  let controller: AbortController | null = null;

  function persistPreferences(
    prefs: AppState["prefs"],
    locationsById: Record<number, Location>,
  ) {
    // Collect Location objects for all saved + selected locations
    const idsToStore = new Set(prefs.savedLocationIds);
    if (prefs.selectedLocationId) idsToStore.add(prefs.selectedLocationId);

    const savedLocations: Record<number, Location> = {};
    for (const id of idsToStore) {
      if (locationsById[id]) savedLocations[id] = locationsById[id];
    }

    savePreferences({
      units: prefs.units,
      savedLocationIds: prefs.savedLocationIds,
      selectedLocationId: prefs.selectedLocationId,
      theme: prefs.theme,
      savedLocations,
    });
  }

  async function loadSelectedLocationForecast() {
    const state = store.getState();
    const id = state.prefs.selectedLocationId;
    if (!id) {
      console.log("[forecastController] No selected location; skipping fetch.");
      return;
    }

    const location = state.entities.locationsById[id];
    if (!location) {
      console.log("[forecastController] Location missing in state:", id);
      return;
    }

    if (controller) {
      console.log("[forecastController] Aborting in-flight request.");
      controller.abort();
    }
    const ac = new AbortController();
    controller = ac;

    console.log("[forecastController] Loading forecast:", {
      locationId: location.id,
      units: state.prefs.units,
    });

    // store a loading flag
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, toast: undefined, loadingForecast: true },
    }));

    try {
      console.log("[forecastController] Fetch start:", {
        locationId: location.id,
        units: state.prefs.units,
      });
      const forecast = await getForecast(location, state.prefs.units, {
        signal: ac.signal,
      });

      const key = forecastKey(location.id, state.prefs.units);

      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          forecastsByKey: {
            ...state.entities.forecastsByKey,
            [key]: forecast,
          },
        },
      }));
      console.log("[forecastController] Fetch success:", key);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("[forecastController] Fetch aborted.");
        return;
      }

      store.setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          toast: { kind: "error", message: "Failed to load forecast." },
        },
      }));
      console.log("[forecastController] Fetch failed:", error);
    } finally {
      if (controller === ac) {
        controller = null;
        store.setState((state) => ({
          ...state,
          ui: { ...state.ui, loadingForecast: false },
        }));
      }
    }
  }

  async function loadForecastForLocation(locationId: number) {
    const state = store.getState();
    const location = state.entities.locationsById[locationId];
    if (!location) return;

    const key = forecastKey(locationId, state.prefs.units);
    if (state.entities.forecastsByKey[key]) return; // already cached

    try {
      const forecast = await getForecast(location, state.prefs.units);
      store.setState((s) => ({
        ...s,
        entities: {
          ...s.entities,
          forecastsByKey: {
            ...s.entities.forecastsByKey,
            [key]: forecast,
          },
        },
      }));
    } catch (error) {
      console.warn(
        "[forecastController] Failed to load forecast for",
        locationId,
        error,
      );
    }
  }

  async function loadAllSavedForecasts() {
    const state = store.getState();
    const ids = state.prefs.savedLocationIds;
    if (ids.length === 0) return;
    console.log(
      "[forecastController] Loading forecasts for saved locations:",
      ids,
    );
    await Promise.allSettled(ids.map((id) => loadForecastForLocation(id)));
  }

  function selectLocation(locationId: number) {
    console.log("[forecastController] Select location:", locationId);
    store.setState((state) => {
      const next = {
        ...state,
        prefs: {
          ...state.prefs,
          selectedLocationId: locationId,
        },
      };
      persistPreferences(next.prefs, next.entities.locationsById);
      return next;
    });
    void loadSelectedLocationForecast();
  }

  function setUnits(units: Units) {
    console.log("[forecastController] Set units:", units);
    store.setState((state) => {
      const next = {
        ...state,
        prefs: {
          ...state.prefs,
          units,
        },
      };
      persistPreferences(next.prefs, next.entities.locationsById);
      return next;
    });
    void loadSelectedLocationForecast();
    void loadAllSavedForecasts();
  }

  function toggleSavedLocation(locationId: number) {
    console.log("[forecastController] Toggle saved location:", locationId);
    store.setState((state) => {
      const isSaved = state.prefs.savedLocationIds.includes(locationId);
      const savedLocationIds = isSaved
        ? state.prefs.savedLocationIds.filter((id) => id !== locationId)
        : [...state.prefs.savedLocationIds, locationId];

      const next = {
        ...state,
        prefs: {
          ...state.prefs,
          savedLocationIds,
        },
      };

      persistPreferences(next.prefs, next.entities.locationsById);
      return next;
    });

    // If we just saved (not removed), load forecast for sidebar display
    const afterState = store.getState();
    if (afterState.prefs.savedLocationIds.includes(locationId)) {
      void loadForecastForLocation(locationId);
    }
  }

  function removeLocation(locationId: number) {
    console.log("[forecastController] Remove location:", locationId);
    store.setState((state) => {
      const savedLocationIds = state.prefs.savedLocationIds.filter(
        (id) => id !== locationId,
      );
      // Clear selection if the removed location was selected
      const selectedLocationId =
        state.prefs.selectedLocationId === locationId
          ? savedLocationIds[0]
          : state.prefs.selectedLocationId;

      const next = {
        ...state,
        prefs: {
          ...state.prefs,
          savedLocationIds,
          selectedLocationId,
        },
      };

      persistPreferences(next.prefs, next.entities.locationsById);
      return next;
    });

    // Load forecast for the newly selected location (if changed)
    void loadSelectedLocationForecast();
  }

  return {
    loadSelectedLocationForecast,
    loadAllSavedForecasts,
    selectLocation,
    setUnits,
    toggleSavedLocation,
    removeLocation,
    persistPreferences() {
      const state = store.getState();
      persistPreferences(state.prefs, state.entities.locationsById);
    },
  };
}
