function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export class Project {
  constructor({
    id = makeId("p"),
    name,
    todoIds = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    const n = String(name ?? "").trim();
    if (!n) throw new Error("Project name is required");

    this.id = id;
    this.name = n;
    this.todoIds = Array.from(todoIds); // ordering matters for DnD
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  rename(newName) {
    const n = String(newName ?? "").trim();
    if (!n) throw new Error("Project name is required");
    this.name = n;
    this.touch();
  }

  addTodoId(todoId) {
    if (!this.todoIds.includes(todoId)) this.todoIds.push(todoId);
    this.touch();
  }

  removeTodoId(todoId) {
    this.todoIds = this.todoIds.filter((id) => id !== todoId);
    this.touch();
  }

  reorderTodoIds(newOrder) {
    this.todoIds = Array.from(newOrder);
    this.touch();
  }

  touch() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      todoIds: this.todoIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    return new Project(data);
  }
}
