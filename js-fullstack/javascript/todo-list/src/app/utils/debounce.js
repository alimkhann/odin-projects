export function debounce(fn, delayMs = 300) {
  let timerId = null;

  return (...args) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delayMs);
  };
}
