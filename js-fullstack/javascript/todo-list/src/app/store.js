import { Project } from "../domain/project.js";
import {
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from "./persistance/storage.js";
import { migrateState } from "./persistance/migrate.js";
import { rehydrateState } from "./persistance/rehydrate.js";
import { reducer } from "./reducer.js";

export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  function getState() {
    return state;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function dispatch(action) {
    // Use reducer to get new state
    state = reducer(state, action);
    // Notify all subscribers with new state
    listeners.forEach((fn) => fn(state, action));
  }

  return {
    getState,
    subscribe,
    dispatch,
  };
}

export function createDefaultState() {
  const inbox = new Project({ id: "p_inbox", name: "Inbox", todoIds: [] });

  return {
    schemaVersion: 1,
    activeView: { type: "project", projectId: "p_inbox" },
    projects: [inbox],
    todos: {},
  };
}

function serializeForSave(state) {
  return {
    schemaVersion: state.schemaVersion,
    activeView: state.activeView,
    projects: state.projects.map((p) => p.toJSON()),
    todos: Object.fromEntries(
      Object.entries(state.todos).map(([id, t]) => [id, t.toJSON()]),
    ),
  };
}


const rawState = loadStateFromLocalStorage();
const migratedState = migrateState(rawState);
const initialState = migratedState
  ? rehydrateState(migratedState)
  : createDefaultState();

export const store = createStore(initialState);

store.subscribe((state) => {
  saveStateToLocalStorage(serializeForSave(state));
});
