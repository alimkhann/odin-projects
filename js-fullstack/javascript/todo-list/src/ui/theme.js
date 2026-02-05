const THEME_KEY = "odin_tasks_theme";

/**
 * Set theme on document root
 * @param {'light' | 'dark'} theme
 */
export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Get current theme from localStorage or default to light
 * @returns {'light' | 'dark'}
 */
export function getTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

/**
 * Toggle between light and dark theme
 * @returns {'light' | 'dark'} The new theme
 */
export function toggleTheme() {
  const current = getTheme();
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}

/**
 * Initialize theme on app load
 * Reads from localStorage or defaults to light theme
 */
export function initTheme() {
  const savedTheme = getTheme();
  setTheme(savedTheme);
  console.log(`🎨 Theme initialized: ${savedTheme}`);
}

/**
 * Optional: Detect system theme preference
 * @returns {'light' | 'dark'}
 */
export function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
