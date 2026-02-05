import { addDays, addWeeks, addMonths, parseISO, format } from "date-fns";
import { ActionTypes } from "../actions.js";

/**
 * Compute the next due date based on recurrence rule
 * @param {string} dueDate - Current due date (YYYY-MM-DD)
 * @param {Object} recurrenceRule - Recurrence rule { freq: "daily"|"weekly"|"monthly", interval: number }
 * @returns {string} Next due date (YYYY-MM-DD)
 */
export function computeNextDueDate(dueDate, recurrenceRule) {
  if (!dueDate || !recurrenceRule) {
    return null;
  }

  const { freq, interval = 1 } = recurrenceRule;
  const currentDate = parseISO(dueDate);

  let nextDate;

  switch (freq) {
    case "daily":
      nextDate = addDays(currentDate, interval);
      break;

    case "weekly":
      nextDate = addWeeks(currentDate, interval);
      break;

    case "monthly":
      nextDate = addMonths(currentDate, interval);
      break;

    default:
      throw new Error(`Unknown recurrence frequency: ${freq}`);
  }

  return format(nextDate, "yyyy-MM-dd");
}

/**
 * Handle recurrence when a todo is completed
 * Creates a new todo instance for the next occurrence
 * @param {Object} store - The store instance
 * @param {Object} completedTodo - The todo that was just completed
 * @param {string} projectId - The project the todo belongs to
 */
export function handleRecurrenceOnComplete(store, completedTodo, projectId) {
  if (!completedTodo.recurrenceRule) {
    return;
  }

  const nextDueDate = computeNextDueDate(
    completedTodo.dueDate,
    completedTodo.recurrenceRule
  );

  if (!nextDueDate) {
    console.warn("Could not compute next due date for recurring todo");
    return;
  }

  // Create the next instance
  // Carry over: title, description, priority, tags, recurrenceRule, dueTime
  // Reset: done, checklist (all items reset to undone), createdAt, updatedAt
  const nextTodoData = {
    title: completedTodo.title,
    description: completedTodo.description,
    dueDate: nextDueDate,
    dueTime: completedTodo.dueTime,
    priority: completedTodo.priority,
    notes: completedTodo.notes,
    tags: [...completedTodo.tags], // Clone array
    checklist: completedTodo.checklist.map((item) => ({
      ...item,
      done: false, // Reset checklist items
    })),
    done: false,
    recurrenceRule: completedTodo.recurrenceRule,
  };

  store.dispatch({
    type: ActionTypes.TODO_CREATED,
    payload: {
      todoData: nextTodoData,
      projectId: projectId,
    },
  });
}

/**
 * Create a recurrence rule object
 * @param {string} freq - Frequency: "daily", "weekly", or "monthly"
 * @param {number} interval - Interval (e.g., 1 for every week, 2 for every 2 weeks)
 * @returns {Object} Recurrence rule object
 */
export function createRecurrenceRule(freq, interval = 1) {
  const allowed = ["daily", "weekly", "monthly"];
  if (!allowed.includes(freq)) {
    throw new Error(`Invalid frequency. Must be one of: ${allowed.join(", ")}`);
  }

  if (!Number.isInteger(interval) || interval < 1) {
    throw new Error("Interval must be a positive integer");
  }

  return { freq, interval };
}
