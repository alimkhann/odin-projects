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
