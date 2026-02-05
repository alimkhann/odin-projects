import {
  isToday,
  isAfter,
  isBefore,
  parseISO,
  addDays,
  startOfDay,
} from "date-fns";

export function selectProjects(state) {
  return state.projects;
}

export function selectTodosMap(state) {
  return state.todos;
}

export function selectActiveView(state) {
  return state.activeView;
}

export function selectProjectById(state, projectId) {
  return state.projects.find((p) => p.id === projectId) ?? null;
}

export function selectTodoById(state, todoId) {
  return state.todos[todoId] ?? null;
}

export function selectAllTodos(state) {
  return Object.values(state.todos);
}

export function selectTodosForProject(state, projectId) {
  const project = selectProjectById(state, projectId);
  if (!project) return [];

  // follow the project's todoIds order
  return project.todoIds.map((id) => state.todos[id]).filter(Boolean); // filter out any missing/corrupt ids
}

function safeParseDateOnly(isoDate) {
  return isoDate ? parseISO(isoDate) : null;
}

export function selectCompletedTodos(state) {
  return selectAllTodos(state).filter((t) => t.done);
}

export function selectTodayTodos(state) {
  return selectAllTodos(state).filter((t) => {
    if (t.done) return false;
    const dueDate = safeParseDateOnly(t.dueDate);
    return dueDate ? isToday(dueDate) : false;
  });
}

export function selectUpcomingTodos(state, days = 7) {
  const today = startOfDay(new Date());
  const endDate = addDays(today, days);

  return selectAllTodos(state).filter((t) => {
    if (t.done) return false;
    const dueDate = safeParseDateOnly(t.dueDate);
    if (!dueDate) return false;
    return isAfter(dueDate, today) && isBefore(dueDate, endDate);
  });
}

export function selectTodosByTag(state, tag) {
  const needle = String(tag ?? "").trim();
  if (!needle) return [];

  return selectAllTodos(state).filter((t) => t.tags?.includes(needle));
}

export function selectTodosBySearch(state, query) {
  const needle = String(query ?? "")
    .trim()
    .toLowerCase();
  if (!needle) return [];

  return selectAllTodos(state).filter((t) => {
    const searchText = `${t.title} ${t.description} ${t.notes}`.toLowerCase();
    return searchText.includes(needle);
  });
}

export function selectTodosForActiveView(state) {
  const view = selectActiveView(state);

  switch (view.type) {
    case "inbox":
      return selectTodosForProject(state, "p_inbox");

    case "project":
      return selectTodosForProject(state, view.projectId);

    case "today":
      return selectTodayTodos(state);

    case "upcoming":
      return selectUpcomingTodos(state, 7);

    case "completed":
      return selectCompletedTodos(state);

    case "tag":
      return selectTodosByTag(state, view.tag);

    case "search":
      return selectTodosBySearch(state, view.q);

    default:
      return [];
  }
}

// get count of incomplete todos for a project (for badges)
export function selectIncompleteTodoCountForProject(state, projectId) {
  const todos = selectTodosForProject(state, projectId);
  return todos.filter((t) => !t.done).length;
}

export function selectActiveProject(state) {
  const view = selectActiveView(state);
  if (view.type === "project") {
    return selectProjectById(state, view.projectId);
  }
  return null;
}
