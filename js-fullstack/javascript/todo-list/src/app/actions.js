export const ActionTypes = {
  INIT: "INIT",
  TODO_CREATED: "TODO_CREATED",
  TODO_UPDATED: "TODO_UPDATED",
  TODO_TOGGLED: "TODO_TOGGLED",
  TODO_DELETED: "TODO_DELETED",
  TODO_REORDERED: "TODO_REORDERED",
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_RENAMED: "PROJECT_RENAMED",
  PROJECT_DELETED: "PROJECT_DELETED",
  SET_ACTIVE_VIEW: "SET_ACTIVE_VIEW",
};

export function createTodo(todoData) {
  return {
    type: ActionTypes.TODO_CREATED,
    payload: todoData,
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

export function reorderTodos(newOrder) {
  return {
    type: ActionTypes.TODO_REORDERED,
    payload: newOrder,
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
    type: ActionTypes.ACTIVE_VIEW_SET,
    payload: view,
  };
}
