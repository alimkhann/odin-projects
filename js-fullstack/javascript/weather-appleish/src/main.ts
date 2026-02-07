import "./style.css";
import { createForecastController } from "./controllers/forecastController";
import { createSearchController } from "./controllers/searchController";
import { appStore } from "./store/appStore";
import { mountApp } from "./ui/appView";

const search = createSearchController(appStore);
const forecast = createForecastController(appStore);

const rootElement = document.querySelector<HTMLElement>("#app");
if (!rootElement) throw new Error("Missing #app");

const view = mountApp(rootElement, {
  onQuery: (q) => void search.setQuery(q),
  onPickLocation: (id) => forecast.selectLocation(id),
});

function rerender() {
  view.update(appStore.getState());
}

appStore.subscribe(rerender);
rerender();

void forecast.loadSelectedLocationForecast();
