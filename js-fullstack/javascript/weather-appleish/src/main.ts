import "./style.css";
import { createForecastController } from "./controllers/forecastController";
import { createSearchController } from "./controllers/searchController";
import { appStore } from "./store/appStore";
import type { ModalType, Theme } from "./store/state";
import { mountApp } from "./ui/appView";

const search = createSearchController(appStore);
const forecast = createForecastController(appStore);

const rootElement = document.querySelector<HTMLElement>("#app");
if (!rootElement) throw new Error("Missing #app");

const view = mountApp(rootElement, {
  onQuery: (q) => void search.setQuery(q),

  onPickLocation: (id) => {
    forecast.selectLocation(id);
    search.clear();
  },

  onSaveLocation: (id) => {
    const state = appStore.getState();
    if (!state.prefs.savedLocationIds.includes(id)) {
      forecast.toggleSavedLocation(id);
    }
  },

  onToggleSaved: (id) => forecast.toggleSavedLocation(id),
  onSetUnits: (units) => forecast.setUnits(units),

  onToggleSidebar: () => {
    appStore.setState((s) => ({
      ...s,
      ui: { ...s.ui, sidebarCollapsed: !s.ui.sidebarCollapsed },
    }));
  },

  onToggleTheme: () => {
    appStore.setState((s) => {
      const newTheme: Theme = s.prefs.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      return { ...s, prefs: { ...s.prefs, theme: newTheme } };
    });
    forecast.persistPreferences();
  },

  onOpenModal: (type: ModalType) => {
    appStore.setState((s) => ({
      ...s,
      ui: { ...s.ui, activeModal: type },
    }));
  },

  onCloseModal: () => {
    appStore.setState((s) => ({
      ...s,
      ui: { ...s.ui, activeModal: undefined },
    }));
  },
});

function rerender() {
  view.update(appStore.getState());
}

appStore.subscribe(rerender);

/* Apply persisted theme on load */
document.documentElement.setAttribute(
  "data-theme",
  appStore.getState().prefs.theme,
);

rerender();

void forecast.loadSelectedLocationForecast();
