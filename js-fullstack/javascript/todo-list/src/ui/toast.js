let toastRoot = null;
let toastCounter = 0;

function ensureToastRoot() {
  if (toastRoot) return toastRoot;

  toastRoot = document.getElementById("toast-root");
  if (!toastRoot) {
    toastRoot = document.createElement("div");
    toastRoot.id = "toast-root";
    toastRoot.className = "toast-root";
    document.body.appendChild(toastRoot);
  }

  return toastRoot;
}

function dismissToast(toast) {
  if (!toast) return;
  toast.classList.add("toast--hide");
  const removeToast = () => {
    if (toast.isConnected) toast.remove();
  };
  toast.addEventListener("transitionend", removeToast, { once: true });
  // Fallback in case transitionend doesn't fire
  setTimeout(removeToast, 200);
}

export function showToast({
  message,
  type = "info",
  actionLabel,
  onAction,
  duration = 4000,
} = {}) {
  if (!message) return;

  const root = ensureToastRoot();
  const toastId = `toast-${++toastCounter}`;
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.dataset.toastId = toastId;

  const messageEl = document.createElement("span");
  messageEl.className = "toast__message";
  messageEl.textContent = message;
  toast.appendChild(messageEl);

  if (actionLabel) {
    const actionBtn = document.createElement("button");
    actionBtn.className = "toast__action";
    actionBtn.type = "button";
    actionBtn.textContent = actionLabel;
    actionBtn.addEventListener("click", () => {
      if (typeof onAction === "function") onAction();
      dismissToast(toast);
    });
    toast.appendChild(actionBtn);
  }

  root.appendChild(toast);

  if (duration && duration > 0) {
    let timeoutId = setTimeout(() => dismissToast(toast), duration);
    toast.addEventListener("mouseenter", () => {
      clearTimeout(timeoutId);
    });
    toast.addEventListener("mouseleave", () => {
      timeoutId = setTimeout(() => dismissToast(toast), duration);
    });
  }

  return toastId;
}
