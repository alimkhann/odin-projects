import { ActionTypes } from "../actions.js";
import { handleRecurrenceOnComplete } from "./recurrence.js";

/**
 * Create a new todo in a project
 * @param {Object} store - The store instance
 * @param {Object} params - Todo creation parameters
 * @param {string} params.projectId - Project to add the todo to (defaults to inbox)
 * @param {string} params.title - Todo title
 * @param {string} params.description - Todo description
 * @param {string} params.dueDate - Due date (YYYY-MM-DD)
 * @param {string} params.dueTime - Due time (HH:mm)
 * @param {number} params.priority - Priority (1-4)
 * @param {string[]} params.tags - Tags array
 * @param {Array} params.checklist - Checklist items
 * @param {Object} params.recurrenceRule - Recurrence rule
 */
export function createTodo(store, { projectId = "p_inbox", ...todoData }) {
  if (!todoData.title || !String(todoData.title).trim()) {
    throw new Error("Todo title is required");
  }

  store.dispatch({
    type: ActionTypes.TODO_CREATED,
    payload: { todoData, projectId },
  });
}

/**
 * Update an existing todo
 * @param {Object} store - The store instance
 * @param {string} id - Todo ID
 * @param {Object} changes - Fields to update (partial Todo object)
 */
export function updateTodo(store, id, changes) {
  if (!id) {
    throw new Error("Todo ID is required");
  }

  store.dispatch({
    type: ActionTypes.TODO_UPDATED,
    payload: { id, changes },
  });
}

/**
 * Toggle todo done status and handle recurrence
 * @param {Object} store - The store instance
 * @param {string} id - Todo ID
 * @param {string} projectId - Project ID (needed for recurrence)
 */
export function toggleTodoDone(store, id, projectId) {
  if (!id) {
    throw new Error("Todo ID is required");
  }

  const state = store.getState();
  const todo = state.todos[id];

  if (!todo) {
    throw new Error(`Todo with ID ${id} not found`);
  }

  store.dispatch({
    type: ActionTypes.TODO_TOGGLED,
    payload: { id },
  });

  // If todo is now done AND has recurrence rule, create next instance
  const updatedState = store.getState();
  const updatedTodo = updatedState.todos[id];

  if (updatedTodo.done && updatedTodo.recurrenceRule) {
    handleRecurrenceOnComplete(store, updatedTodo, projectId);
  }
}

/**
 * Delete a todo
 * @param {Object} store - The store instance
 * @param {string} id - Todo ID
 */
export function deleteTodo(store, id) {
  if (!id) {
    throw new Error("Todo ID is required");
  }

  store.dispatch({
    type: ActionTypes.TODO_DELETED,
    payload: { id },
  });
}

/**
 * Reorder todos within a project (for drag & drop)
 * @param {Object} store - The store instance
 * @param {string} projectId - Project ID
 * @param {string[]} todoIds - New order of todo IDs
 */
export function reorderTodos(store, projectId, todoIds) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!Array.isArray(todoIds)) {
    throw new Error("todoIds must be an array");
  }

  store.dispatch({
    type: ActionTypes.TODO_REORDERED,
    payload: { projectId, todoIds },
  });
}

/**
 * Move a todo from one project to another
 * @param {Object} store - The store instance
 * @param {string} todoId - Todo ID
 * @param {string} fromProjectId - Source project ID
 * @param {string} toProjectId - Destination project ID
 */
export function moveTodoToProject(store, todoId, fromProjectId, toProjectId) {
  if (!todoId || !fromProjectId || !toProjectId) {
    throw new Error("Todo ID, from project ID, and to project ID are required");
  }

  if (fromProjectId === toProjectId) {
    return; // No need to move if source and destination are the same
  }

  store.dispatch({
    type: ActionTypes.TODO_MOVED,
    payload: { todoId, fromProjectId, toProjectId },
  });
}
