import { store } from "../app/store.js";
import { renderSidebar } from "./render/sidebar.js";
import { renderList } from "./render/list.js";
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

function render() {
  mountSidebar();
  mountList();
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
