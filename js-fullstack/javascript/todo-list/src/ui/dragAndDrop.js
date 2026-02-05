import Sortable from "sortablejs";
import { selectActiveView } from "../app/services/queries.js";
import {
  reorderTodos,
  toggleTodoDone,
  moveTodoToProject,
} from "../app/services/todos.js";
import { setActiveView } from "../app/actions.js";

let taskListSortable = null;
let sidebarSortables = [];

/**
 * Initialize or reinitialize all drag and drop functionality
 */
export function initDragAndDrop(store) {
  // Destroy existing instances
  if (taskListSortable) {
    taskListSortable.destroy();
    taskListSortable = null;
  }

  sidebarSortables.forEach((s) => s.destroy());
  sidebarSortables = [];

  // Initialize task list dragging
  initTaskListDragging(store);

  // Initialize sidebar drop zones
  initSidebarDropZones(store);
}

/**
 * Initialize dragging within task list
 */
function initTaskListDragging(store) {
  const listTasks = document.querySelector(".list-tasks");
  if (!listTasks) return;

  taskListSortable = Sortable.create(listTasks, {
    group: "tasks",
    animation: 150,
    handle: ".task-drag-handle",
    draggable: ".task-row",
    ghostClass: "task-row--ghost",
    chosenClass: "task-row--chosen",
    dragClass: "task-row--dragging",
    onEnd: (evt) => {
      const activeView = selectActiveView(store.getState());

      // Only allow reordering in project and inbox views
      if (activeView.type !== "project" && activeView.type !== "inbox") {
        // Cancel the sort by putting item back
        evt.item.remove();
        return;
      }

      // Get project ID (inbox is p_inbox)
      const projectId =
        activeView.type === "inbox" ? "p_inbox" : activeView.projectId;

      // Read new order from DOM
      const taskRows = listTasks.querySelectorAll(".task-row");
      const todoIds = Array.from(taskRows).map((row) => row.dataset.todoId);

      // Dispatch reorder action
      if (todoIds.length > 0) {
        reorderTodos(store, projectId, todoIds);
      }
    },
  });
}

/**
 * Helper function to find which project a todo belongs to
 */
function findTodoProject(state, todoId) {
  const project = state.projects.find((p) => p.todoIds.includes(todoId));
  return project ? project.id : "p_inbox";
}

/**
 * Initialize drop zones in sidebar (projects and views)
 */
function initSidebarDropZones(store) {
  // Projects section - allow dropping to move to project
  const projectItems = document.querySelectorAll(
    '.sidebar-item[data-action="set-view"][data-view="project"]',
  );

  projectItems.forEach((item) => {
    const sortable = Sortable.create(item, {
      group: {
        name: "tasks",
        put: true,
        pull: false,
      },
      sort: false,
      animation: 150,
      draggable: ".this-class-does-not-exist", // Prevent sorting within sidebar items
      onMove: (evt) => {
        // Add visual feedback
        evt.to.classList.add("sidebar-item--drag-over");
        return false; // Prevent actual insertion
      },
      onAdd: (evt) => {
        const todoId = evt.item.dataset.todoId;
        const targetProjectId = item.dataset.projectId;

        // Remove drag-over class
        item.classList.remove("sidebar-item--drag-over");

        if (todoId && targetProjectId) {
          const state = store.getState();
          const todo = state.todos[todoId];

          // Find which project the todo currently belongs to
          const fromProjectId = findTodoProject(state, todoId);

          // If the todo is completed, unmark it first when moving to a regular project
          if (todo && todo.done) {
            toggleTodoDone(store, todoId, fromProjectId);
          }

          // Move the todo to the target project (only if different)
          if (fromProjectId !== targetProjectId) {
            moveTodoToProject(store, todoId, fromProjectId, targetProjectId);
          }

          // Navigate to the target project
          store.dispatch(
            setActiveView({ type: "project", projectId: targetProjectId }),
          );
        }

        // Remove the dragged element (it will be re-rendered)
        evt.item.remove();
      },
    });

    sidebarSortables.push(sortable);
  });

  // Completed view - allow dropping to mark as done
  const completedView = document.querySelector(
    '.sidebar-item[data-view="completed"]',
  );
  if (completedView) {
    const sortable = Sortable.create(completedView, {
      group: {
        name: "tasks",
        put: true,
        pull: false,
      },
      sort: false,
      animation: 150,
      draggable: ".this-class-does-not-exist", // Prevent sorting within sidebar items
      onMove: (evt) => {
        // Add visual feedback
        evt.to.classList.add("sidebar-item--drag-over");
        return false; // Prevent actual insertion
      },
      onAdd: (evt) => {
        const todoId = evt.item.dataset.todoId;

        // Remove drag-over class
        completedView.classList.remove("sidebar-item--drag-over");

        if (todoId) {
          const state = store.getState();
          const todo = state.todos[todoId];

          // Mark as complete if not already done
          if (todo && !todo.done) {
            const projectId = findTodoProject(state, todoId);
            toggleTodoDone(store, todoId, projectId);
          }

          // Navigate to completed view
          store.dispatch(setActiveView({ type: "completed" }));
        }

        evt.item.remove();
      },
    });

    sidebarSortables.push(sortable);
  }

  // Inbox view - allow dropping to move to inbox
  const inboxView = document.querySelector('.sidebar-item[data-view="inbox"]');
  if (inboxView) {
    const sortable = Sortable.create(inboxView, {
      group: {
        name: "tasks",
        put: true,
        pull: false,
      },
      sort: false,
      animation: 150,
      draggable: ".this-class-does-not-exist", // Prevent sorting within sidebar items
      onMove: (evt) => {
        // Add visual feedback
        evt.to.classList.add("sidebar-item--drag-over");
        return false; // Prevent actual insertion
      },
      onAdd: (evt) => {
        const todoId = evt.item.dataset.todoId;

        // Remove drag-over class
        inboxView.classList.remove("sidebar-item--drag-over");

        if (todoId) {
          const state = store.getState();
          const todo = state.todos[todoId];

          // Find current project
          const fromProjectId = findTodoProject(state, todoId);

          // If completed, unmark it
          if (todo && todo.done) {
            toggleTodoDone(store, todoId, fromProjectId);
          }

          // Move to inbox if not already there
          if (fromProjectId !== "p_inbox") {
            moveTodoToProject(store, todoId, fromProjectId, "p_inbox");
          }

          // Navigate to inbox
          store.dispatch(setActiveView({ type: "inbox" }));
        }

        evt.item.remove();
      },
    });

    sidebarSortables.push(sortable);
  }
}
