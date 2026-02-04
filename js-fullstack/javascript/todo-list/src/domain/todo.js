import { makeId } from "./id.js";

function isISODateOnly(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isTimeHHmm(s) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

export function makeChecklistItem(
  text,
  { id = makeId("c"), done = false } = {},
) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) throw new Error("Checklist item text is required");
  return { id, text: trimmed, done: Boolean(done) };
}

export function normalizeRecurrenceRule(rule) {
  if (!rule) return null;
  const freq = rule.freq;
  const interval = Number(rule.interval ?? 1);

  const allowed = new Set(["daily", "weekly", "monthly"]);
  if (!allowed.has(freq))
    throw new Error(`Invalid recurrence frequency: ${freq}`);
  if (!Number.isInteger(interval) || interval < 1) {
    throw new Error("Invalid interval");
  }

  return { freq, interval };
}
export class Todo {
  constructor({
    id = makeId("t"),
    title,
    description = "",
    dueDate = null,
    dueTime = null,
    priority = 3, // 1..4 (1 = highest)
    notes = "",
    tags = [],
    checklist = [],
    done = false,
    recurrenceRule = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    const t = String(title ?? "").trim();
    if (!t) throw new Error("Todo title cannot be empty");

    const p = Number(priority);
    if (![1, 2, 3, 4].includes(p)) throw new Error("Priority must be 1..4");

    this.id = id;
    this.title = t;
    this.description = String(description).trim();

    this.dueDate = dueDate ? String(dueDate) : null;
    if (this.dueDate && !isISODateOnly(this.dueDate)) {
      throw new Error("dueDate must be YYYY-MM-DD or null");
    }

    this.dueTime = dueTime ? String(dueTime) : null;
    if (this.dueTime && !isTimeHHmm(this.dueTime)) {
      throw new Error("dueTime must be HH:mm or null");
    }

    this.priority = p;
    this.notes = String(notes).trim();
    this.tags = Array.from(
      new Set((tags ?? []).map((tag) => String(tag).trim()).filter(Boolean)),
    );
    this.checklist = (checklist ?? []).map((item) => {
      if (typeof item === "string") return makeChecklistItem(item);
      if (item && typeof item === "object")
        return makeChecklistItem(item.text, item);
      throw new Error("Invalid checklist item");
    });
    this.done = Boolean(done);
    this.recurrenceRule = normalizeRecurrenceRule(recurrenceRule);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  rename(newTitle) {
    const t = String(newTitle ?? "").trim();
    if (!t) throw new Error("Todo title is required");
    this.title = t;
    this.touch();
  }

  setDescription(desc) {
    this.description = String(desc ?? "").trim();
    this.touch();
  }

  setDueDate(isoOrNull) {
    this.dueDate = isoOrNull ? String(isoOrNull) : null;
    if (this.dueDate && !isISODateOnly(this.dueDate)) {
      throw new Error("dueDate must be YYYY-MM-DD or null");
    }
    this.touch();
  }

  setDueTime(timeOrNull) {
    this.dueTime = timeOrNull ? String(timeOrNull) : null;
    if (this.dueTime && !isTimeHHmm(this.dueTime)) {
      throw new Error("dueTime must be HH:mm or null");
    }
    this.touch();
  }

  setPriority(p) {
    const n = Number(p);
    if (![1, 2, 3, 4].includes(n)) throw new Error("Priority must be 1..4");
    this.priority = n;
    this.touch();
  }

  setNotes(notes) {
    this.notes = String(notes ?? "").trim();
    this.touch();
  }

  toggleDone() {
    this.done = !this.done;
    this.touch();
  }

  addTag(tag) {
    const t = String(tag ?? "").trim();
    if (!t) return;
    if (!this.tags.includes(t)) this.tags.push(t);
    this.touch();
  }

  removeTag(tag) {
    this.tags = this.tags.filter((t) => t !== tag);
    this.touch();
  }

  addChecklistItem(text) {
    this.checklist.push(makeChecklistItem(text));
    this.touch();
  }

  toggleChecklistItem(itemId) {
    const item = this.checklist.find((i) => i.id === itemId);
    if (!item) return;
    item.done = !item.done;
    this.touch();
  }

  removeChecklistItem(itemId) {
    this.checklist = this.checklist.filter((i) => i.id !== itemId);
    this.touch();
  }

  setRecurrence(ruleOrNull) {
    this.recurrenceRule = normalizeRecurrenceRule(ruleOrNull);
    this.touch();
  }

  touch() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      dueTime: this.dueTime,
      priority: this.priority,
      notes: this.notes,
      tags: this.tags,
      checklist: this.checklist,
      done: this.done,
      recurrenceRule: this.recurrenceRule,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    return new Todo(data);
  }
}
