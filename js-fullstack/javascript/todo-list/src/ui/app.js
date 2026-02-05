import { store } from "../app/store.js";
import { renderSidebar } from "./render/sidebar.js";
import { renderList } from "./render/list.js";
import { renderDetails } from "./render/details.js";
import { bindEvents } from "./bindEvents.js";
import { initTheme } from "./theme.js";

function mountSidebar() {
  const sidebarContainer = document.getElementById("sidebar");
  const sidebarHTML = renderSidebar(store.getState());
  sidebarContainer.innerHTML = sidebarHTML;
}

function mountList() {
  const mainContainer = document.getElementById("main");
  const listHTML = renderList(store.getState());
  mainContainer.innerHTML = listHTML;
}

function mountDetails() {
  const detailsContainer = document.getElementById("details");
  const state = store.getState();

  // Only show details panel if a task is selected
  if (state.selectedTodoId) {
    detailsContainer.style.display = "block";
    const detailsHTML = renderDetails(state);
    detailsContainer.innerHTML = detailsHTML;
  } else {
    detailsContainer.style.display = "none";
  }
}

function render() {
  mountSidebar();
  mountList();
  mountDetails();
}

export function initApp() {
  console.log("🚀 Initializing Odin Tasks...");

  initTheme();

  render();

  // Bind all event listeners
  bindEvents(store);

  // Subscribe to store changes and re-render
  store.subscribe(() => {
    console.log("📊 State changed, re-rendering...");
    render();
  });

  console.log("✅ Odin Tasks initialized successfully!");
}
