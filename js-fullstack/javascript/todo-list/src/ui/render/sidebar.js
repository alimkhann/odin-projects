import {
  selectProjects,
  selectActiveView,
  selectTodosForProject,
  selectTodayTodos,
  selectUpcomingTodos,
  selectCompletedTodos,
  selectAllTodos,
} from "../../app/services/queries.js";

import logoIcon from "../../assets/logo/logo.svg";
import inboxIcon from "../../assets/icons/inbox.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import upcomingIcon from "../../assets/icons/upcoming.svg";
import checkmarkIcon from "../../assets/icons/checkmark.svg";
import folderIcon from "../../assets/icons/folder.svg";
import plusIcon from "../../assets/icons/plus.svg";
import settingsIcon from "../../assets/icons/settings.svg";
import ellipsisIcon from "../../assets/icons/ellipsis-vertical.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import trashIcon from "../../assets/icons/trash.svg";

/**
 * Get count for a smart view
 */
function getSmartViewCount(state, viewType) {
  switch (viewType) {
    case "inbox":
      return selectTodosForProject(state, "p_inbox").filter((t) => !t.done)
        .length;
    case "today":
      return selectTodayTodos(state).filter((t) => !t.done).length;
    case "upcoming":
      return selectUpcomingTodos(state).filter((t) => !t.done).length;
    case "completed":
      return selectCompletedTodos(state).length;
    default:
      return 0;
  }
}

/**
 * Get count for a project
 */
function getProjectCount(state, projectId) {
  return selectTodosForProject(state, projectId).filter((t) => !t.done).length;
}

/**
 * Render a smart view item
 */
function renderSmartView(view, icon, count, isActive) {
  const activeClass = isActive ? "sidebar-item--active" : "";
  const countMarkup =
    count > 0 ? `<span class="sidebar-item__count">${count}</span>` : "";

  return `
    <div
      class="sidebar-item ${activeClass}"
      data-action="set-view"
      data-view="${view}"
    >
      <img src="${icon}" alt="" class="sidebar-item__icon" />
      <span class="sidebar-item__text">${view.charAt(0).toUpperCase() + view.slice(1)}</span>
      ${countMarkup}
    </div>
  `;
}

/**
 * Render a project item
 */
function renderProject(project, count, isActive) {
  const activeClass = isActive ? "sidebar-item--active" : "";
  const countMarkup =
    count > 0 ? `<span class="sidebar-item__count">${count}</span>` : "";

  return `
    <div class="project-row">
      <div
        class="sidebar-item ${activeClass}"
        data-action="set-view"
        data-view="project"
        data-project-id="${project.id}"
      >
        <img src="${folderIcon}" alt="" class="sidebar-item__icon" />
        <span class="sidebar-item__text">${project.name}</span>
        ${countMarkup}
        <div class="project-menu">
          <button
            class="project-menu-btn"
            data-action="toggle-project-menu"
            data-project-id="${project.id}"
            aria-label="Project options"
          >
            <img src="${ellipsisIcon}" alt="" />
          </button>
          <div class="project-menu-dropdown" data-project-id="${project.id}">
            <button class="project-menu-item" data-action="rename-project" data-project-id="${project.id}">
              <img class="project-menu-item__icon" src="${pencilIcon}" alt="" />
              Rename
            </button>
            <button class="project-menu-item project-menu-item--danger" data-action="delete-project" data-project-id="${project.id}">
              <img class="project-menu-item__icon" src="${trashIcon}" alt="" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Main sidebar render function
 */
export function renderSidebar(state) {
  const activeView = selectActiveView(state);
  const projects = selectProjects(state);

  const inboxCount = getSmartViewCount(state, "inbox");
  const todayCount = getSmartViewCount(state, "today");
  const upcomingCount = getSmartViewCount(state, "upcoming");
  const completedCount = getSmartViewCount(state, "completed");

  const smartViews = [
    renderSmartView(
      "inbox",
      inboxIcon,
      inboxCount,
      activeView.type === "inbox",
    ),
    renderSmartView(
      "today",
      calendarIcon,
      todayCount,
      activeView.type === "today",
    ),
    renderSmartView(
      "upcoming",
      upcomingIcon,
      upcomingCount,
      activeView.type === "upcoming",
    ),
    renderSmartView(
      "completed",
      checkmarkIcon,
      completedCount,
      activeView.type === "completed",
    ),
  ].join("");

  const projectItems = projects
    .filter((p) => p.id !== "p_inbox")
    .map((project) => {
      const count = getProjectCount(state, project.id);
      const isActive =
        activeView.type === "project" && activeView.projectId === project.id;
      return renderProject(project, count, isActive);
    })
    .join("");

  return `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="${logoIcon}" alt="Odin Tasks" class="sidebar-logo__icon" />
          <h1 class="sidebar-logo__text">Odin Tasks</h1>
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-views">
          ${smartViews}
        </div>
      </div>

      <div class="sidebar-section sidebar-section--projects">
        <div class="sidebar-projects-header">
          <h3 class="sidebar-section__title">Projects</h3>
          <button
            class="sidebar-add-btn"
            data-action="open-new-project-modal"
            aria-label="Add project"
          >
            <img src="${plusIcon}" alt="" class="sidebar-add-btn__icon" />
          </button>
        </div>
        <div class="sidebar-projects">
          ${projectItems || '<p class="sidebar-empty">No projects yet</p>'}
        </div>
      </div>

      <div class="sidebar-footer">
        <button
          class="sidebar-settings-btn"
          data-action="open-settings-modal"
        >
          <img src="${settingsIcon}" alt="" class="sidebar-settings-btn__icon" />
          <span class="sidebar-settings-btn__text">Settings</span>
        </button>
      </div>
    </div>
  `;
}
