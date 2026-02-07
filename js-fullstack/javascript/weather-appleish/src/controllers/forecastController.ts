import type { Units } from "../domain/weather.ts";
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

  function persistPreferences(prefs: AppState["prefs"]) {
    savePreferences({
      units: prefs.units,
      savedLocationIds: prefs.savedLocationIds,
      selectedLocationId: prefs.selectedLocationId,
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
      persistPreferences(next.prefs);
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
      persistPreferences(next.prefs);
      return next;
    });
    void loadSelectedLocationForecast();
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

      persistPreferences(next.prefs);
      return next;
    });
  }

  return {
    loadSelectedLocationForecast,
    selectLocation,
    setUnits,
    toggleSavedLocation,
  };
}
