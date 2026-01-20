const themeSwitchBtn = document.getElementById("theme-icon-btn");
const themeMenu = document.getElementById("theme-menu");
const themeIcon = document.getElementById("theme-icon");

const themeIcons = {
  light: "/assets/icons/sun.svg",
  dark: "/assets/icons/moon.svg",
  system: "/assets/icons/sun-moon.svg",
};

function setTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  if (themeIcon && themeIcons[theme]) {
    themeIcon.src = themeIcons[theme];
  }

  localStorage.setItem("saved-theme", theme);
}

function closeThemeMenu() {
  themeMenu?.classList.remove("show");
  themeSwitchBtn?.setAttribute("aria-expanded", "false");
}

themeSwitchBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = themeMenu.classList.toggle("show");
  themeSwitchBtn.setAttribute("aria-expanded", String(isOpen));
});

themeMenu?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-theme]");
  if (!button) return;
  setTheme(button.getAttribute("data-theme"));
  closeThemeMenu();
});

window.addEventListener("click", () => {
  closeThemeMenu();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeThemeMenu();
});

const savedTheme = localStorage.getItem("saved-theme") || "system";
setTheme(savedTheme);

const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarLogo = document.getElementById("sidebar-logo");
const sidebarToggleIcon = document.getElementById("sidebar-toggle-icon");
const sidebar = document.querySelector(".sidebar");

function setSidebarCollapsed(isCollapsed) {
  document.body.classList.toggle("sidebar-collapsed", isCollapsed);
  sidebarToggle?.setAttribute("aria-expanded", String(!isCollapsed));
  sidebarToggle?.setAttribute(
    "aria-label",
    isCollapsed ? "Expand sidebar" : "Collapse sidebar",
  );
  if (sidebarToggleIcon) {
    sidebarToggleIcon.src = isCollapsed
      ? "/assets/icons/panel-left-open.svg"
      : "/assets/icons/panel-left-close.svg";
  }
  if (sidebarToggle) {
    sidebarToggle.style.opacity = isCollapsed ? "" : "0";
  }
}

sidebarToggle?.addEventListener("click", () => {
  const isCollapsed = document.body.classList.toggle("sidebar-collapsed");
  setSidebarCollapsed(isCollapsed);
});

sidebarLogo?.addEventListener("click", () => {
  if (!document.body.classList.contains("sidebar-collapsed")) return;
  setSidebarCollapsed(false);
});

setSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));

function updateToggleOpacity(event) {
  if (!sidebarToggle || !sidebar) return;
  if (document.body.classList.contains("sidebar-collapsed")) return;

  const rect = sidebarToggle.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const maxDistance = 180;
  const clamped = Math.min(distance, maxDistance);
  const proximity = 1 - clamped / maxDistance;
  const opacity = 0.5 + proximity * 0.5;

  sidebarToggle.style.opacity = String(opacity);
}

sidebar?.addEventListener("mouseenter", () => {
  if (!sidebarToggle) return;
  if (document.body.classList.contains("sidebar-collapsed")) return;
  sidebarToggle.style.opacity = "0.5";
});

sidebar?.addEventListener("mousemove", updateToggleOpacity);

sidebar?.addEventListener("mouseleave", () => {
  if (!sidebarToggle) return;
  if (document.body.classList.contains("sidebar-collapsed")) return;
  sidebarToggle.style.opacity = "0";
});
