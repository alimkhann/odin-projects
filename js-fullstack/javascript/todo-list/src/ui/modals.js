import closeIcon from "../assets/icons/close.svg";
import themeIcon from "../assets/icons/theme.svg";
import exportIcon from "../assets/icons/export.svg";
import importIcon from "../assets/icons/import.svg";
import infoIcon from "../assets/icons/info.svg";
import { setTheme, getTheme } from "./theme.js";
import { showToast } from "./toast.js";
import { exportStateToJson, importStateFromJson } from "../app/services/dataTransfer.js";
import { createDefaultState, store } from "../app/store.js";
import { initState } from "../app/actions.js";

function createModal({ title, content, footer, className }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = `modal ${className || ""}`.trim();

  const header = document.createElement("div");
  header.className = "modal-header";

  const titleEl = document.createElement("h2");
  titleEl.className = "modal-title";
  titleEl.textContent = title;

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = `<img src="${closeIcon}" alt="" />`;

  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  modal.appendChild(header);
  if (content) modal.appendChild(content);
  if (footer) modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  document.body.classList.add("modal-open");

  const close = () => {
    overlay.remove();
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", handleEsc);
  };

  const handleEsc = (event) => {
    if (event.key === "Escape") close();
  };

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", handleEsc);

  return { close, modal, overlay };
}

export function openProjectModal({
  mode = "create",
  initialName = "",
  onSave,
} = {}) {
  const isRename = mode === "rename";
  const title = isRename ? "Rename Project" : "New Project";

  const body = document.createElement("div");
  body.className = "modal-body";

  const form = document.createElement("form");
  form.className = "modal-form";

  const label = document.createElement("label");
  label.className = "modal-label";
  label.textContent = "Project Name";

  const input = document.createElement("input");
  input.className = "modal-input";
  input.type = "text";
  input.placeholder = "Enter project name";
  input.value = initialName || "";
  input.setAttribute("maxlength", "60");

  const error = document.createElement("div");
  error.className = "modal-error";
  error.textContent = "Please enter a project name.";

  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(error);
  body.appendChild(form);

  const footer = document.createElement("div");
  footer.className = "modal-footer";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "modal-btn";
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";

  const saveBtn = document.createElement("button");
  saveBtn.className = "modal-btn modal-btn--primary";
  saveBtn.type = "submit";
  saveBtn.textContent = "Save";

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  const { close } = createModal({ title, content: body, footer });

  const submit = () => {
    const value = input.value.trim();
    if (!value) {
      input.classList.add("modal-input--error");
      error.classList.add("modal-error--visible");
      input.focus();
      return;
    }
    if (typeof onSave === "function") onSave(value);
    close();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submit();
  });

  input.addEventListener("input", () => {
    input.classList.remove("modal-input--error");
    error.classList.remove("modal-error--visible");
  });

  cancelBtn.addEventListener("click", close);

  setTimeout(() => input.focus(), 0);
}

export function openConfirmModal({
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  onConfirm,
} = {}) {
  const body = document.createElement("div");
  body.className = "modal-body";

  const messageEl = document.createElement("p");
  messageEl.className = "modal-message";
  messageEl.textContent = message;
  body.appendChild(messageEl);

  const footer = document.createElement("div");
  footer.className = "modal-footer";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "modal-btn";
  cancelBtn.type = "button";
  cancelBtn.textContent = cancelLabel;

  const confirmBtn = document.createElement("button");
  confirmBtn.className = `modal-btn ${isDanger ? "modal-btn--danger" : "modal-btn--primary"}`;
  confirmBtn.type = "button";
  confirmBtn.textContent = confirmLabel;

  footer.appendChild(cancelBtn);
  footer.appendChild(confirmBtn);

  const { close } = createModal({
    title,
    content: body,
    footer,
    className: "modal--confirm",
  });

  cancelBtn.addEventListener("click", close);
  confirmBtn.addEventListener("click", () => {
    close();
    if (typeof onConfirm === "function") onConfirm();
  });
}

export function openSettingsModal() {
  const body = document.createElement("div");
  body.className = "modal-body";

  body.innerHTML = `
    <section class="settings-section">
      <div class="settings-section__label">
        <img src="${themeIcon}" alt="" />
        <span>Theme</span>
      </div>
      <div class="settings-theme">
        <button class="settings-pill" data-action="set-theme" data-theme="light">Light</button>
        <button id="theme-pill-dark" class="settings-pill" data-action="set-theme" data-theme="dark">Dark</button>
      </div>
    </section>

    <div class="settings-divider"></div>

    <section class="settings-section">
      <div class="settings-section__label">
        <span>Data Management</span>
      </div>
      <button class="settings-action" data-action="export-data">
        <img src="${exportIcon}" alt="" />
        Export Data (JSON)
      </button>
      <button class="settings-action" data-action="import-data">
        <img src="${importIcon}" alt="" />
        Import Data (JSON)
      </button>
      <button class="settings-action settings-action--danger" data-action="clear-storage">
        Clear Local Storage
      </button>
      <input class="settings-file-input" type="file" accept=".json,application/json" />
    </section>

    <div class="settings-divider"></div>

    <section class="settings-section">
      <div class="settings-section__label">
        <img src="${infoIcon}" alt="" />
        <span>About</span>
      </div>
      <div class="settings-about">
        <div class="settings-about__row">
          <span>App Name:</span>
          <span>Odin Tasks</span>
        </div>
        <div class="settings-about__row">
          <span>Version:</span>
          <span>1.0.0</span>
        </div>
        <div class="settings-about__row">
          <span>Storage Schema:</span>
          <span>v${store.getState().schemaVersion ?? 1}</span>
        </div>
      </div>
    </section>
  `;

  const footer = document.createElement("div");
  footer.className = "modal-footer";

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-btn";
  closeBtn.type = "button";
  closeBtn.textContent = "Close";
  footer.appendChild(closeBtn);

  const { close, modal } = createModal({
    title: "Settings",
    content: body,
    footer,
    className: "modal--settings",
  });

  closeBtn.addEventListener("click", close);

  const updateThemeButtons = () => {
    const current = getTheme();
    modal.querySelectorAll('[data-action="set-theme"]').forEach((btn) => {
      const isActive = btn.dataset.theme === current;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  };

  updateThemeButtons();

  const fileInput = modal.querySelector(".settings-file-input");
  const exportBtn = modal.querySelector('[data-action="export-data"]');
  const importBtn = modal.querySelector('[data-action="import-data"]');
  const clearBtn = modal.querySelector('[data-action="clear-storage"]');

  modal.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    if (action === "set-theme") {
      setTheme(btn.dataset.theme);
      updateThemeButtons();
      return;
    }

    if (action === "export-data") {
      const json = exportStateToJson(store.getState());
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "odin-tasks.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast({ message: "Data exported successfully", type: "success" });
      return;
    }

    if (action === "import-data") {
      fileInput.value = "";
      fileInput.click();
      return;
    }

    if (action === "clear-storage") {
      openConfirmModal({
        title: "Clear Local Storage?",
        message: "This will remove all saved data from this device.",
        confirmLabel: "Clear",
        isDanger: true,
        onConfirm: () => {
          localStorage.clear();
          document.documentElement.setAttribute("data-theme", "light");
          store.dispatch(initState(createDefaultState()));
          showToast({ message: "Local storage cleared", type: "success" });
          close();
        },
      });
    }
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importStateFromJson(store, text);
      showToast({ message: "Data imported successfully", type: "success" });
      close();
    } catch (error) {
      showToast({ message: "Import failed", type: "error" });
    } finally {
      fileInput.value = "";
    }
  });
}
