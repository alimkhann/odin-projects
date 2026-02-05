import { setActiveView } from "../app/actions.js";
import { createTodo, toggleTodoDone } from "../app/services/todos.js";
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
      // For now, use prompt (we'll add modal in Phase 4)
      const title = prompt("Enter task title:");
      if (title && title.trim()) {
        const state = store.getState();
        const activeView = state.activeView;

        // Determine which project to add to
        let projectId = "p_inbox";
        if (activeView.type === "project") {
          projectId = activeView.projectId;
        }

        createTodo(store, {
          title: title.trim(),
          projectId,
          priority: 3,
        });
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
      // Placeholder for Slice B (Details Panel)
      console.log("Task details will be implemented in Slice B");
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
 * Bind all events
 */
export function bindEvents(store) {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");

  sidebar.addEventListener("click", (e) => handleSidebarClick(store, e));

  main.addEventListener("click", (e) => handleListClick(store, e));

  // Search input - trigger on Enter key press
  main.addEventListener("keydown", (e) => {
    if (e.target.matches('[data-action="search"]') && e.key === 'Enter') {
      handleSearchInput(store, e);
    }
  });

  console.log("✅ Events bound successfully!");
}
