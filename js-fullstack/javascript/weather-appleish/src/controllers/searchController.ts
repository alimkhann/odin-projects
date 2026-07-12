import type { Location } from "../domain/weather.ts";
import { searchLocations } from "../services/geocodingService.ts";
import type { AppState } from "../store/state.ts";

type Store = {
  getState: () => AppState;
  setState: (updater: (previousState: AppState) => AppState) => void;
};

function upsertLocations(
  previous: Record<number, Location>,
  incoming: Location[],
): Record<number, Location> {
  const next = { ...previous };
  for (const location of incoming) {
    next[location.id] = location;
  }
  return next;
}

export function createSearchController(store: Store) {
  let controller: AbortController | null = null;

  async function setQuery(query: string) {
    console.log("[searchController] setQuery:", query);
    store.setState((state) => ({
      ...state,
      search: { ...state.search, query, loading: true, error: undefined },
    }));

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      if (controller) {
        console.log("[searchController] Aborting in-flight request.");
        controller.abort();
        controller = null;
      }
      store.setState((state) => ({
        ...state,
        search: {
          ...state.search,
          results: [],
          loading: false,
          error: undefined,
        },
      }));
      return;
    }

    if (controller) {
      console.log("[searchController] Aborting in-flight request.");
      controller.abort();
    }
    const ac = new AbortController();
    controller = ac;

    try {
      console.log("[searchController] Search start:", trimmed);
      const locations = await searchLocations(trimmed, {
        signal: ac.signal,
      });
      const ids = locations.map((l) => l.id);

      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          locationsById: upsertLocations(
            state.entities.locationsById,
            locations,
          ),
        },
        search: {
          ...state.search,
          results: ids,
          loading: false,
          error: undefined,
        },
      }));
      console.log("[searchController] Search success:", ids.length);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.log("[searchController] Search aborted.");
        return;
      }

      store.setState((state) => ({
        ...state,
        search: {
          ...state.search,
          results: [],
          loading: false,
          error: "Search failed.",
        },
        ui: {
          ...state.ui,
          toast: { kind: "error", message: "Failed to search locations." },
        },
      }));
      console.log("[searchController] Search failed:", err);
    } finally {
      if (controller === ac) {
        controller = null;
      }
    }
  }

  function clear() {
    if (controller) {
      console.log("[searchController] Clearing and aborting request.");
      controller.abort();
    }
    store.setState((state) => ({
      ...state,
      search: {
        ...state.search,
        query: "",
        results: [],
        loading: false,
        error: undefined,
      },
    }));
  }

  return { setQuery, clear };
}
