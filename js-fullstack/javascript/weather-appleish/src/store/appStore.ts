import { loadPreferences } from "../services/preferencesService.ts";
import { createStore } from "./createStore.ts";
import type { AppState } from "./state.ts";

function createInitialState(): AppState {
  const savedPrefs = loadPreferences();

  return {
    prefs: {
      units: savedPrefs.units,
      savedLocationIds: savedPrefs.savedLocationIds,
      selectedLocationId: savedPrefs.selectedLocationId,
      theme:
        (savedPrefs as Record<string, unknown>).theme === "dark"
          ? "dark"
          : "light",
    },
    entities: {
      locationsById: {},
      forecastsByKey: {},
    },
    search: {
      query: "",
      results: [],
      loading: false,
      error: undefined,
    },
    ui: {
      sidebarCollapsed: false,
      loadingForecast: false,
      activeModal: undefined,
      toast: undefined,
    },
  };
}

export const appStore = createStore(createInitialState());
