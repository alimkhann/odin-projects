import { ActionTypes } from "../actions.js";

/**
 * Create a new project and optionally set it as active view
 * @param {Object} store - The store instance
 * @param {string} name - Project name
 * @param {boolean} setActive - Whether to switch to this project after creation
 */
export function createProject(store, name, setActive = false) {
  const trimmedName = String(name ?? "").trim();
  if (!trimmedName) {
    throw new Error("Project name is required");
  }

  store.dispatch({
    type: ActionTypes.PROJECT_CREATED,
    payload: { name: trimmedName },
  });

  if (setActive) {
    const state = store.getState();
    const newProject = state.projects[state.projects.length - 1];
    if (newProject) {
      store.dispatch({
        type: ActionTypes.SET_ACTIVE_VIEW,
        payload: { type: "project", projectId: newProject.id },
      });
    }
  }
}

/**
 * Rename an existing project
 * @param {Object} store - The store instance
 * @param {string} projectId - ID of the project to rename
 * @param {string} newName - New project name
 */
export function renameProject(store, projectId, newName) {
  const trimmedName = String(newName ?? "").trim();
  if (!trimmedName) {
    throw new Error("Project name is required");
  }

  store.dispatch({
    type: ActionTypes.PROJECT_RENAMED,
    payload: { id: projectId, name: trimmedName },
  });
}

/**
 * Delete a project and all its todos
 * @param {Object} store - The store instance
 * @param {string} projectId - ID of the project to delete
 */
export function deleteProject(store, projectId) {
  if (projectId === "p_inbox") {
    throw new Error("Cannot delete the Inbox project");
  }

  store.dispatch({
    type: ActionTypes.PROJECT_DELETED,
    payload: { id: projectId },
  });

  const state = store.getState();
  if (state.activeView.type === "project" && state.activeView.projectId === projectId) {
    store.dispatch({
      type: ActionTypes.SET_ACTIVE_VIEW,
      payload: { type: "project", projectId: "p_inbox" },
    });
  }
}

/**
 * Restore a previously deleted project and its todos
 * @param {Object} store - The store instance
 * @param {Object} projectData - Serialized project data
 * @param {Object[]} todos - Serialized todos belonging to the project
 */
export function restoreProject(store, projectData, todos = []) {
  if (!projectData || !projectData.id) {
    throw new Error("Project data is required");
  }

  store.dispatch({
    type: ActionTypes.PROJECT_RESTORED,
    payload: { projectData, todos },
  });
}
