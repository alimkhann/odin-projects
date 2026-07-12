export const ActionTypes = {
  INIT: "INIT",
  TODO_CREATED: "TODO_CREATED",
  TODO_UPDATED: "TODO_UPDATED",
  TODO_TOGGLED: "TODO_TOGGLED",
  TODO_DELETED: "TODO_DELETED",
  TODO_RESTORED: "TODO_RESTORED",
  TODO_REORDERED: "TODO_REORDERED",
  TODO_MOVED: "TODO_MOVED",
  TODO_SELECTED: "TODO_SELECTED",
  TODO_DESELECTED: "TODO_DESELECTED",
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_RENAMED: "PROJECT_RENAMED",
  PROJECT_DELETED: "PROJECT_DELETED",
  PROJECT_RESTORED: "PROJECT_RESTORED",
  SET_ACTIVE_VIEW: "SET_ACTIVE_VIEW",
  SET_FILTER: "SET_FILTER",
};

export function initState(state) {
  return {
    type: ActionTypes.INIT,
    payload: state,
  };
}

export function createTodo(todoData, projectId = "p_inbox") {
  return {
    type: ActionTypes.TODO_CREATED,
    payload: { todoData, projectId },
  };
}

export function updateTodo(todoId, changes) {
  return {
    type: ActionTypes.TODO_UPDATED,
    payload: { id: todoId, changes },
  };
}

export function toggleTodo(todoId) {
  return {
    type: ActionTypes.TODO_TOGGLED,
    payload: { id: todoId },
  };
}

export function reorderTodos(projectId, todoIds) {
  return {
    type: ActionTypes.TODO_REORDERED,
    payload: { projectId, todoIds },
  };
}

export function deleteTodo(todoId) {
  return {
    type: ActionTypes.TODO_DELETED,
    payload: { id: todoId },
  };
}

export function createProject(projectData) {
  return {
    type: ActionTypes.PROJECT_CREATED,
    payload: projectData,
  };
}

export function setActiveView(view) {
  return {
    type: ActionTypes.SET_ACTIVE_VIEW,
    payload: view,
  };
}

export function selectTodo(todoId) {
  return {
    type: ActionTypes.TODO_SELECTED,
    payload: { id: todoId },
  };
}

export function deselectTodo() {
  return {
    type: ActionTypes.TODO_DESELECTED,
  };
}

export function setFilter(filter) {
  return {
    type: ActionTypes.SET_FILTER,
    payload: filter,
  };
}
