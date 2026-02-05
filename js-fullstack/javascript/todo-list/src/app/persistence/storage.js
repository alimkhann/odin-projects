const STORAGE_KEY = "todo_app_data_v1";

export function saveStateToLocalStorage(stateObject) {
  try {
    const serializedState = JSON.stringify(stateObject);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
}

export function loadStateFromLocalStorage() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) return null;
    return JSON.parse(rawState);
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
    return null;
  }
}
