import { ActionTypes } from "../actions.js";
import { migrateState } from "../persistence/migrate.js";
import { rehydrateState } from "../persistence/rehydrate.js";
import { createDefaultState } from "../store.js";

function serializeState(state) {
  return {
    schemaVersion: state.schemaVersion,
    activeView: state.activeView,
    projects: state.projects.map((p) => p.toJSON()),
    todos: Object.fromEntries(
      Object.entries(state.todos).map(([id, t]) => [id, t.toJSON()]),
    ),
  };
}

export function exportStateToJson(state) {
  return JSON.stringify(serializeState(state), null, 2);
}

export function importStateFromJson(store, jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Invalid JSON file");
  }

  const migrated = migrateState(parsed) ?? parsed;
  const rehydrated = rehydrateState(migrated);
  const defaults = createDefaultState();

  const nextState = {
    ...defaults,
    ...rehydrated,
    selectedTodoId: null,
    filter: rehydrated.filter ?? defaults.filter,
    activeView: rehydrated.activeView ?? defaults.activeView,
  };

  store.dispatch({
    type: ActionTypes.INIT,
    payload: nextState,
  });
}
