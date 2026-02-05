import { format } from "date-fns";
import iconClose from "../../assets/icons/close.svg";
import iconCalendar from "../../assets/icons/calendar.svg";
import iconClock from "../../assets/icons/clock.svg";
import iconTag from "../../assets/icons/tag.svg";
import iconList from "../../assets/icons/list.svg";
import iconPlus from "../../assets/icons/plus.svg";
import iconRepeat from "../../assets/icons/repeat.svg";
import iconTrash from "../../assets/icons/trash.svg";

/**
 * Renders the task details panel
 * @param {Object} state - Application state
 * @returns {string} HTML string
 */
export function renderDetails(state) {
  const { selectedTodoId, todos } = state;

  // If no task selected, show empty state
  if (!selectedTodoId) {
    return `
      <div class="details-panel">
        <div class="details-empty">
          <p class="details-empty__text">Select a task to view details</p>
        </div>
      </div>
    `;
  }

  const todo = todos[selectedTodoId];

  // If todo not found (deleted?), show empty state
  if (!todo) {
    return `
      <div class="details-panel">
        <div class="details-empty">
          <p class="details-empty__text">Task not found</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="details-panel">
      <div class="details-header">
        <h3 class="details-header__title">Task Details</h3>
        <button
          class="details-close-btn"
          data-action="close-details"
          aria-label="Close details panel"
        >
          <img src="${iconClose}" alt="" class="details-close-btn__icon" />
        </button>
      </div>

      <div class="details-content">
        <!-- Title Input -->
        <div class="details-field">
          <input
            type="text"
            class="details-input details-input--title"
            data-action="update-title"
            data-todo-id="${todo.id}"
            value="${escapeHtml(todo.title)}"
            placeholder="Task title"
          />
        </div>

        <!-- Description Textarea -->
        <div class="details-field">
          <label class="details-label">Description</label>
          <textarea
            class="details-textarea"
            data-action="update-description"
            data-todo-id="${todo.id}"
            placeholder="Add a description..."
            rows="4"
          >${escapeHtml(todo.description || "")}</textarea>
        </div>

        <!-- Due Date -->
        <div class="details-field">
          <label class="details-label">
            <img src="${iconCalendar}" alt="" class="details-label__icon" />
            Due Date
          </label>
          <input
            type="date"
            class="details-input details-input--date"
            data-action="update-due-date"
            data-todo-id="${todo.id}"
            value="${todo.dueDate || ""}"
          />
        </div>

        <!-- Due Time -->
        <div class="details-field">
          <label class="details-label">
            <img src="${iconClock}" alt="" class="details-label__icon" />
            Due Time (24h)
          </label>
          <input
            type="time"
            class="details-input details-input--time"
            data-action="update-due-time"
            data-todo-id="${todo.id}"
            value="${todo.dueTime || ""}"
          />
        </div>

        <!-- Priority Buttons -->
        <div class="details-field">
          <label class="details-label">Priority</label>
          <div class="priority-buttons">
            ${[1, 2, 3, 4]
              .map((priority) => {
                const isActive = todo.priority === priority;
                return `
                  <button
                    class="priority-btn ${isActive ? "priority-btn--active" : ""}"
                    data-action="set-priority"
                    data-priority="P${priority}"
                    data-todo-id="${todo.id}"
                  >
                    P${priority}
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>

        <!-- Tags -->
        <div class="details-field">
          <label class="details-label">
            <img src="${iconTag}" alt="" class="details-label__icon" />
            Tags
          </label>
          <div class="details-tags">
            ${renderTags(todo.tags)}
          </div>
          <select
            class="details-select"
            data-action="add-tag"
            data-todo-id="${todo.id}"
          >
            <option value="">Add a tag...</option>
            ${["Work", "Personal", "Urgent", "Important"]
              .filter((tag) => !todo.tags.includes(tag))
              .map((tag) => `<option value="${tag}">${tag}</option>`)
              .join("")}
          </select>
        </div>

        <!-- Checklist -->
        <div class="details-field">
          <label class="details-label">
            <img src="${iconList}" alt="" class="details-label__icon" />
            Checklist
          </label>
          <div class="details-checklist">
            ${renderChecklistItems(todo.checklist, todo.id)}
          </div>
          <div class="checklist-add">
            <input
              type="text"
              class="details-input details-input--checklist"
              data-action="checklist-input"
              data-todo-id="${todo.id}"
              placeholder="Add item..."
            />
            <button
              class="btn-add-checklist"
              data-action="add-checklist-item"
              data-todo-id="${todo.id}"
            >
              <img src="${iconPlus}" alt="" class="btn-add-checklist__icon" />
            </button>
          </div>
        </div>

        <!-- Recurring -->
        <div class="details-field">
          <label class="details-label">
            <img src="${iconRepeat}" alt="" class="details-label__icon" />
            Recurring
          </label>
          <select
            class="details-select"
            data-action="set-recurring"
            data-todo-id="${todo.id}"
          >
            <option value="" ${!todo.recurrenceRule ? "selected" : ""}>None</option>
            <option value="daily" ${todo.recurrenceRule?.freq === "daily" ? "selected" : ""}>Daily</option>
            <option value="weekly" ${todo.recurrenceRule?.freq === "weekly" ? "selected" : ""}>Weekly</option>
            <option value="monthly" ${todo.recurrenceRule?.freq === "monthly" ? "selected" : ""}>Monthly</option>
          </select>
        </div>
      </div>

      <!-- Footer with Delete Button -->
      <div class="details-footer">
        <button
          class="btn-delete"
          data-action="delete-todo"
          data-todo-id="${todo.id}"
        >
          <img src="${iconTrash}" alt="" class="btn-delete__icon" />
          Delete Task
        </button>
      </div>
    </div>
  `;
}

/**
 * Render tags with remove buttons
 */
function renderTags(tags = []) {
  if (tags.length === 0) return "";

  return tags
    .map((tag) => {
      return `
        <span class="tag" data-tag="${tag}">
          ${tag}
          <button
            class="tag__remove"
            data-action="remove-tag"
            data-tag="${tag}"
            aria-label="Remove ${tag} tag"
          >
            <img src="${iconClose}" alt="" class="tag__remove-icon" />
          </button>
        </span>
      `;
    })
    .join("");
}

/**
 * Render checklist items
 */
function renderChecklistItems(checklist = [], todoId) {
  if (checklist.length === 0) return "";

  return checklist
    .map((item, index) => {
      return `
        <div class="checklist-item">
          <div
            class="checklist-item__checkbox ${item.done ? "checklist-item__checkbox--checked" : ""}"
            data-action="toggle-checklist-item"
            data-todo-id="${todoId}"
            data-index="${index}"
            role="checkbox"
            aria-checked="${item.done}"
            tabindex="0"
          >
            ${item.done ? '<span class="checklist-item__check">✓</span>' : ""}
          </div>
          <label
            class="checklist-item__label ${item.done ? "checklist-item__label--done" : ""}"
          >
            ${escapeHtml(item.text)}
          </label>
          <button
            class="checklist-item__remove"
            data-action="remove-checklist-item"
            data-todo-id="${todoId}"
            data-index="${index}"
            aria-label="Remove checklist item"
          >
            <img src="${iconClose}" alt="" class="checklist-item__remove-icon" />
          </button>
        </div>
      `;
    })
    .join("");
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
