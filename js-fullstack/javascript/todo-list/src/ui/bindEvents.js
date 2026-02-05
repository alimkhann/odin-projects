import {
  setActiveView,
  selectTodo,
  deselectTodo,
  setFilter,
} from "../app/actions.js";
import {
  createTodo,
  toggleTodoDone,
  updateTodo,
  deleteTodo,
} from "../app/services/todos.js";
import { createProject } from "../app/services/projects.js";

/**
 * Handle sidebar events
 */
function handleSidebarClick(store, event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;

  switch (action) {
    case "set-view": {
      const viewType = target.dataset.view;
      const projectId = target.dataset.projectId;

      if (viewType === "project" && projectId) {
        store.dispatch(setActiveView({ type: "project", projectId }));
      } else {
        store.dispatch(setActiveView({ type: viewType }));
      }
      break;
    }

    case "open-new-project-modal": {
      // For now, use prompt (we'll add modal in Phase 4)
      const name = prompt("Enter project name:");
      if (name && name.trim()) {
        createProject(store, name.trim(), true);
      }
      break;
    }

    case "open-settings-modal": {
      // Placeholder for Phase 4
      alert("Settings modal will be implemented in Phase 4");
      break;
    }
  }
}

/**
 * Handle main list events
 */
function handleListClick(store, event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;

  switch (action) {
    case "create-todo": {
      const state = store.getState();
      const activeView = state.activeView;

      // Determine which project to add to
      let projectId = "p_inbox";
      if (activeView.type === "project") {
        projectId = activeView.projectId;
      }

      // Create the todo with default name
      createTodo(store, {
        title: "New Task",
        projectId,
        priority: 2,
      });

      // Get the newly created todo's ID from the updated state
      const updatedState = store.getState();
      const newTodoId = Object.keys(updatedState.todos).pop();

      // Immediately select the new task to open details panel
      if (newTodoId) {
        store.dispatch(selectTodo(newTodoId));
      }
      break;
    }

    case "toggle-todo": {
      event.stopPropagation(); // Prevent row selection
      const todoId = target.dataset.todoId;
      const state = store.getState();
      const activeView = state.activeView;

      // Find which project this todo belongs to
      let projectId = "p_inbox";
      if (activeView.type === "project") {
        projectId = activeView.projectId;
      } else {
        // Find the project containing this todo
        const projects = state.projects;
        for (const project of projects) {
          if (project.todoIds.includes(todoId)) {
            projectId = project.id;
            break;
          }
        }
      }

      toggleTodoDone(store, todoId, projectId);
      break;
    }

    case "select-todo": {
      const todoId = target.dataset.todoId;
      store.dispatch(selectTodo(todoId));
      break;
    }

    case "cycle-filter": {
      const state = store.getState();
      const currentFilter = state.filter || "default";
      const filters = ["default", "due-date", "priority"];
      const currentIndex = filters.indexOf(currentFilter);
      const nextIndex = (currentIndex + 1) % filters.length;
      store.dispatch(setFilter(filters[nextIndex]));
      break;
    }

    case "toggle-sort": {
      // Placeholder for later enhancement
      alert("Sort functionality coming soon!");
      break;
    }
  }
}

/**
 * Handle search input
 */
function handleSearchInput(store, event) {
  const query = event.target.value.trim();

  if (query) {
    store.dispatch(setActiveView({ type: "search", q: query }));
  } else {
    // Return to inbox when search is cleared
    store.dispatch(setActiveView({ type: "inbox" }));
  }
}

/**
 * Handle details panel events
 */
function handleDetailsInput(store, event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const todoId =
    target.dataset.todoId || target.closest("[data-todo-id]")?.dataset.todoId;

  switch (action) {
    case "close-details": {
      store.dispatch(deselectTodo());
      break;
    }

    case "set-priority": {
      const priority = parseInt(target.dataset.priority.replace("P", ""), 10);
      updateTodo(store, todoId, { priority });
      break;
    }

    case "add-tag": {
      const tag = target.value;
      if (tag) {
        const state = store.getState();
        const todo = state.todos[todoId];
        const tags = [...(todo.tags || []), tag];
        updateTodo(store, todoId, { tags });
        target.value = ""; // Reset dropdown
      }
      break;
    }

    case "remove-tag": {
      event.stopPropagation();
      const tagToRemove = target.dataset.tag;
      // Get todoId from closest parent with the attribute
      const detailsPanel = target.closest(".details-panel");
      const titleInput = detailsPanel?.querySelector(
        '[data-action="update-title"]',
      );
      const actualTodoId = titleInput?.dataset.todoId;

      if (actualTodoId) {
        const state = store.getState();
        const todo = state.todos[actualTodoId];
        const tags = todo.tags.filter((t) => t !== tagToRemove);
        updateTodo(store, actualTodoId, { tags });
      }
      break;
    }

    case "add-checklist-item": {
      const input = document.querySelector('[data-action="checklist-input"]');
      const text = input?.value.trim();
      if (text && todoId) {
        const state = store.getState();
        const todo = state.todos[todoId];
        const checklist = [...(todo.checklist || []), { text, done: false }];
        updateTodo(store, todoId, { checklist });
        input.value = ""; // Clear input
      }
      break;
    }

    case "toggle-checklist-item": {
      const index = parseInt(target.dataset.index, 10);
      const state = store.getState();
      const todo = state.todos[todoId];
      const checklist = [...todo.checklist];
      checklist[index] = { ...checklist[index], done: !checklist[index].done };
      updateTodo(store, todoId, { checklist });
      break;
    }

    case "remove-checklist-item": {
      event.stopPropagation();
      const index = parseInt(target.dataset.index, 10);
      const state = store.getState();
      const todo = state.todos[todoId];
      const checklist = todo.checklist.filter((_, i) => i !== index);
      updateTodo(store, todoId, { checklist });
      break;
    }

    case "delete-todo": {
      if (confirm("Are you sure you want to delete this task?")) {
        deleteTodo(store, todoId);
        store.dispatch(deselectTodo());
      }
      break;
    }
  }
}

/**
 * Debounce utility for text inputs
 */
function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Bind all events
 */
export function bindEvents(store) {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const details = document.getElementById("details");

  sidebar.addEventListener("click", (e) => handleSidebarClick(store, e));

  main.addEventListener("click", (e) => handleListClick(store, e));

  // Details panel click events (buttons, checkboxes)
  details.addEventListener("click", (e) => handleDetailsInput(store, e));

  // Details panel change events (selects, date inputs) - no debounce
  details.addEventListener("change", (e) => {
    if (e.target.matches("[data-action]")) {
      handleDetailsInput(store, e);
    }
  });

  // Details panel blur events for title and description
  details.addEventListener(
    "blur",
    (e) => {
      const target = e.target;
      const todoId = target.dataset.todoId;

      if (target.matches('[data-action="update-title"]')) {
        const title = target.value.trim();
        if (title) {
          updateTodo(store, todoId, { title });
        }
      } else if (target.matches('[data-action="update-description"]')) {
        updateTodo(store, todoId, { description: target.value });
      } else if (target.matches('[data-action="update-due-date"]')) {
        const dueDate = target.value || null;
        updateTodo(store, todoId, { dueDate });
      } else if (target.matches('[data-action="update-due-time"]')) {
        const dueTime = target.value || null;
        updateTodo(store, todoId, { dueTime });
      }
    },
    true,
  );

  // Recurring dropdown - update on change but after a small delay
  details.addEventListener("change", (e) => {
    const target = e.target;
    if (target.matches('[data-action="set-recurring"]')) {
      const todoId = target.dataset.todoId;
      const freq = target.value || null;
      const recurrenceRule = freq ? { freq, interval: 1 } : null;
      // Small delay to let dropdown close naturally
      setTimeout(() => {
        updateTodo(store, todoId, { recurrenceRule });
      }, 100);
    }
  });

  // Search input - trigger on Enter key press
  main.addEventListener("keydown", (e) => {
    if (e.target.matches('[data-action="search"]') && e.key === "Enter") {
      handleSearchInput(store, e);
    }
  });

  // Enter key support for title, description, and checklist
  details.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const target = e.target;

      if (target.matches('[data-action="update-title"]')) {
        target.blur(); // Trigger blur to save
        e.preventDefault();
      } else if (target.matches('[data-action="update-description"]')) {
        if (e.shiftKey) {
          // Allow Shift+Enter for new line
          return;
        }
        target.blur(); // Trigger blur to save
        e.preventDefault();
      } else if (target.matches('[data-action="checklist-input"]')) {
        const addBtn = document.querySelector(
          '[data-action="add-checklist-item"]',
        );
        if (addBtn) addBtn.click();
      }
    }
  });

  console.log("✅ Events bound successfully!");
}
