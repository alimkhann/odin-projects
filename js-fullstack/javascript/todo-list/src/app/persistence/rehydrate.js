import { Todo } from "../../domain/todo.js";
import { Project } from "../../domain/project.js";

export function rehydrateState(rawState) {
  return {
    schemaVersion: rawState.schemaVersion ?? 1,
    activeView: rawState.activeView ?? { type: "project", projectId: null },

    projects: (rawState.projects ?? []).map(Project.fromJSON),

    todos: Object.fromEntries(
      Object.entries(rawState.todos ?? {}).map(([id, todoRaw]) => [
        id,
        Todo.fromJSON(todoRaw),
      ]),
    ),
  };
}
