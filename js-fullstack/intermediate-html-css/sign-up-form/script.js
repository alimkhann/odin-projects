const themeSwitchBtn = document.getElementById("theme-icon-btn");
const menu = document.getElementById("theme-menu");

themeSwitchBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isExpanded = menu.classList.toggle("show");
  themeSwitchBtn.setAttribute("aria-expanded", isExpanded);
});

function setTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  updateThemeIcon(theme);
}

menu.addEventListener("click", (e) => {
  e.stopPropagation();
  const theme = e.target.closest("button")?.getAttribute("data-theme");
  if (!theme) return;

  setTheme(theme);
  localStorage.setItem("saved-theme", theme);
  menu.classList.remove("show");
});

window.addEventListener("click", () => {
  menu.classList.remove("show");
  themeSwitchBtn.setAttribute("aria-expanded", "false");
});

const passwordFields = document.querySelectorAll("#password, #repeat-password");

passwordFields.forEach((field) => {
  field.addEventListener("blur", () => {
    field.classList.add("touched");
  });

  field.addEventListener("input", () => {
    if (field.validity.valid) {
      field.classList.remove("touched");
    }
  });
});

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById("theme-icon");
  if (!themeIcon) return;

  if (theme === "light") {
    themeIcon.src = "/assets/light-theme-icon.svg";
  } else if (theme === "dark") {
    themeIcon.src = "/assets/dark-theme-icon.svg";
  } else {
    themeIcon.src = "/assets/system-theme-icon.svg";
  }
}

const savedTheme = localStorage.getItem("saved-theme");
if (savedTheme) {
  setTheme(savedTheme);
}
