import {
  selectTodosForActiveView,
  selectActiveView,
  selectProjectById,
} from "../../app/services/queries.js";
import { format, isToday, isPast } from "date-fns";

import plusIcon from "../../assets/icons/plus.svg";
import searchIcon from "../../assets/icons/search.svg";
import sortIcon from "../../assets/icons/sort.svg";
import clockIcon from "../../assets/icons/clock.svg";
import repeatIcon from "../../assets/icons/repeat.svg";
import listIcon from "../../assets/icons/list.svg";

/**
 * Get view title based on active view
 */
function getViewTitle(state) {
  const activeView = selectActiveView(state);

  switch (activeView.type) {
    case "inbox":
      return "Inbox";
    case "today":
      return "Today";
    case "upcoming":
      return "Upcoming";
    case "completed":
      return "Completed";
    case "project":
      const project = selectProjectById(state, activeView.projectId);
      return project ? project.name : "Unknown Project";
    case "tag":
      return `#${activeView.tag}`;
    case "search":
      return `Search: "${activeView.q}"`;
    default:
      return "All Tasks";
  }
}

/**
 * Get priority class name
 */
function getPriorityClass(priority) {
  return `priority-p${priority}`;
}

/**
 * Render a due date badge
 */
function renderDueDateBadge(dueDate) {
  if (!dueDate) return "";

  const date = new Date(dueDate + "T00:00:00");
  const isPastDue = isPast(date) && !isToday(date);
  const isTodayDue = isToday(date);

  let badgeClass = "task-badge task-badge--due";
  if (isPastDue) badgeClass += " task-badge--overdue";
  if (isTodayDue) badgeClass += " task-badge--today";

  let displayText;
  if (isTodayDue) {
    displayText = "Today";
  } else if (isPastDue) {
    displayText = format(date, "MMM d");
  } else {
    displayText = format(date, "MMM d");
  }

  return `
    <span class="${badgeClass}">
      <img src="${clockIcon}" alt="" class="task-badge__icon" />
      ${displayText}
    </span>
  `;
}

/**
 * Render a recurrence badge
 */
function renderRecurrenceBadge(recurrenceRule) {
  if (!recurrenceRule) return "";

  const freq = recurrenceRule.freq;
  if (!freq) return "";

  // Capitalize first letter for display
  const displayText = freq.charAt(0).toUpperCase() + freq.slice(1);

  return `
    <span class="task-badge task-badge--recurrence">
      <img src="${repeatIcon}" alt="" class="task-badge__icon" />
      ${displayText}
    </span>
  `;
}

/**
 * Render tag chips
 */
function renderTags(tags) {
  if (!tags || tags.length === 0) return "";

  return tags
    .map(
      (tag) => `
    <span class="task-tag task-tag--${tag.toLowerCase()}" data-tag="${tag}">
      ${tag}
    </span>
  `,
    )
    .join("");
}

/**
 * Render checklist progress
 */
function renderChecklistProgress(checklist) {
  if (!checklist || checklist.length === 0) return "";

  const completed = checklist.filter((item) => item.done).length;
  const total = checklist.length;

  return `
    <span class="task-badge task-badge--checklist">
      <img src="${listIcon}" alt="" class="task-badge__icon" />
      ${completed}/${total}
    </span>
  `;
}

/**
 * Render a single task row
 */
function renderTaskRow(todo, selectedTodoId) {
  const completedClass = todo.done ? "task-row--completed" : "";
  const selectedClass = selectedTodoId === todo.id ? "task-row--selected" : "";
  const priorityClass = getPriorityClass(todo.priority);

  return `
    <div
      class="task-row ${completedClass} ${selectedClass}"
      data-todo-id="${todo.id}"
      data-action="select-todo"
    >
      <div
        class="task-checkbox ${todo.done ? "task-checkbox--checked" : ""}"
        data-action="toggle-todo"
        data-todo-id="${todo.id}"
      >
        ${todo.done ? '<span class="task-checkbox__check">✓</span>' : ""}
      </div>

      <div class="task-content">
        <div class="task-title-row">
          <span class="task-priority-dot ${priorityClass}"></span>
          <span class="task-title">${todo.title}</span>
        </div>

        <div class="task-metadata">
          ${renderDueDateBadge(todo.dueDate)}
          ${renderRecurrenceBadge(todo.recurrenceRule)}
          ${renderTags(todo.tags)}
          ${renderChecklistProgress(todo.checklist)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render empty state
 */
function renderEmptyState(viewTitle) {
  return `
    <div class="list-empty">
      <p class="list-empty__text">No tasks in ${viewTitle}</p>
      <button class="btn btn--primary" data-action="create-todo">
        <img src="${plusIcon}" alt="" class="btn__icon" />
        New Task
      </button>
    </div>
  `;
}

/**
 * Main list render function
 */
export function renderList(state) {
  const viewTitle = getViewTitle(state);
  const activeView = selectActiveView(state);
  const todos = selectTodosForActiveView(state);
  const selectedTodoId = state.selectedTodoId;

  // For completed view, show completed tasks; for others, show active tasks
  const displayTodos =
    activeView.type === "completed"
      ? todos.filter((t) => t.done)
      : todos.filter((t) => !t.done);
  const hasTodos = displayTodos.length > 0;

  return `
    <div class="list">
      <div class="list-header">
        <h2 class="list-title">${viewTitle}</h2>

        <div class="list-controls">
          <button class="btn btn--primary" data-action="create-todo">
            <img src="${plusIcon}" alt="" class="btn__icon" />
            New Task
          </button>
          <button class="btn btn--secondary" data-action="toggle-sort">
            <img src="${sortIcon}" alt="" class="btn__icon" />
            Default
          </button>
        </div>
      </div>

      <div class="list-search">
        <img src="${searchIcon}" alt="" class="list-search__icon" />
        <input
          type="text"
          class="list-search__input"
          placeholder="Search tasks..."
          data-action="search"
          value="${activeView.type === "search" ? activeView.q : ""}"
        />
      </div>

      <div class="list-tasks">
        ${hasTodos ? displayTodos.map((todo) => renderTaskRow(todo, selectedTodoId)).join("") : renderEmptyState(viewTitle)}
      </div>
    </div>
  `;
}
