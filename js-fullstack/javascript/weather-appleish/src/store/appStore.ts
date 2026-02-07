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
      activePanel: undefined,
      toast: undefined,
    },
  };
}

export const appStore = createStore(createInitialState());
