import { ActionTypes } from "./actions.js";
import { Todo } from "../domain/todo.js";
import { Project } from "../domain/project.js";

export function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.TODO_CREATED: {
      const newTodo = new Todo(action.payload);
      return {
        ...state,
        todos: {
          ...state.todos,
          [newTodo.id]: newTodo,
        },
      };
    }

    case ActionTypes.TODO_UPDATED: {
      const { id, changes } = action.payload;
      const existingTodo = state.todos[id];
      if (!existingTodo) return state;

      // Apply changes to the todo
      Object.entries(changes).forEach(([key, value]) => {
        const setter = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (typeof existingTodo[setter] === "function") {
          existingTodo[setter](value);
        }
      });

      return {
        ...state,
        todos: {
          ...state.todos,
          [id]: existingTodo,
        },
      };
    }

    case ActionTypes.TODO_TOGGLED: {
      const { id } = action.payload;
      const todo = state.todos[id];
      if (!todo) return state;

      todo.toggleDone();

      return {
        ...state,
        todos: {
          ...state.todos,
          [id]: todo,
        },
      };
    }

    case ActionTypes.TODO_REORDERED: {
      const newOrder = action.payload; // Array of todo IDs in new order

      // Create a mapping of todo IDs to their new indices
      const orderMap = new Map(newOrder.map((id, index) => [id, index]));

      // Sort todos in each project based on the new order
      const updatedProjects = state.projects.map((project) => {
        const sortedTodoIds = [...project.todoIds].sort((a, b) => {
          const indexA = orderMap.has(a) ? orderMap.get(a) : Infinity;
          const indexB = orderMap.has(b) ? orderMap.get(b) : Infinity;
          return indexA - indexB;
        });
        project.todoIds = sortedTodoIds;
        return project;
      });

      return {
        ...state,
        projects: updatedProjects,
      };
    }

    case ActionTypes.TODO_DELETED: {
      const { id } = action.payload;
      const { [id]: removed, ...remainingTodos } = state.todos;

      // Remove from all projects
      const updatedProjects = state.projects.map((project) => {
        if (project.todoIds.includes(id)) {
          project.removeTodoId(id);
        }
        return project;
      });

      return {
        ...state,
        todos: remainingTodos,
        projects: updatedProjects,
      };
    }

    case ActionTypes.PROJECT_CREATED: {
      const newProject = new Project(action.payload);
      return {
        ...state,
        projects: [...state.projects, newProject],
      };
    }

    case ActionTypes.ACTIVE_VIEW_SET: {
      return {
        ...state,
        activeView: action.payload,
      };
    }

    default:
      return state;
  }
}
