import { ActionTypes } from "./actions.js";
import { Todo } from "../domain/todo.js";
import { Project } from "../domain/project.js";

export function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.INIT: {
      return action.payload;
    }
    case ActionTypes.TODO_CREATED: {
      const { todoData, projectId } = action.payload;
      const newTodo = new Todo(todoData);

      // Add todo to target project
      const updatedProjects = state.projects.map((project) => {
        if (project.id === projectId) {
          const clonedProject = Project.fromJSON(project.toJSON());
          clonedProject.addTodoId(newTodo.id);
          return clonedProject;
        }
        return project;
      });

      return {
        ...state,
        todos: {
          ...state.todos,
          [newTodo.id]: newTodo,
        },
        projects: updatedProjects,
      };
    }

    case ActionTypes.TODO_UPDATED: {
      const { id, changes } = action.payload;
      const existingTodo = state.todos[id];
      if (!existingTodo) return state;

      const clonedTodo = Todo.fromJSON(existingTodo.toJSON());

      Object.entries(changes).forEach(([key, value]) => {
        if (key === "title") {
          clonedTodo.rename(value);
          return;
        }

        const setter = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (typeof clonedTodo[setter] === "function") {
          clonedTodo[setter](value);
        }
      });

      return {
        ...state,
        todos: {
          ...state.todos,
          [id]: clonedTodo,
        },
      };
    }

    case ActionTypes.TODO_TOGGLED: {
      const { id } = action.payload;
      const todo = state.todos[id];
      if (!todo) return state;

      const clonedTodo = Todo.fromJSON(todo.toJSON());
      clonedTodo.toggleDone();

      return {
        ...state,
        todos: {
          ...state.todos,
          [id]: clonedTodo,
        },
      };
    }

    case ActionTypes.TODO_REORDERED: {
      const { projectId, todoIds } = action.payload;

      // Reorder only the specified project
      const updatedProjects = state.projects.map((project) => {
        if (project.id === projectId) {
          const clonedProject = Project.fromJSON(project.toJSON());
          clonedProject.reorderTodoIds(todoIds);
          return clonedProject;
        }
        return project;
      });

      return {
        ...state,
        projects: updatedProjects,
      };
    }

    case ActionTypes.TODO_MOVED: {
      const { todoId, fromProjectId, toProjectId } = action.payload;

      // Remove from source project and add to destination project
      const updatedProjects = state.projects.map((project) => {
        const clonedProject = Project.fromJSON(project.toJSON());

        if (project.id === fromProjectId) {
          clonedProject.removeTodoId(todoId);
        }

        if (project.id === toProjectId) {
          clonedProject.addTodoId(todoId);
        }

        return clonedProject;
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
          const clonedProject = Project.fromJSON(project.toJSON());
          clonedProject.removeTodoId(id);
          return clonedProject;
        }
        return project;
      });

      return {
        ...state,
        todos: remainingTodos,
        projects: updatedProjects,
      };
    }

    case ActionTypes.TODO_RESTORED: {
      const { todoData, projectId } = action.payload;
      const restoredTodo = Todo.fromJSON(todoData);

      const targetProjectId = state.projects.some((p) => p.id === projectId)
        ? projectId
        : "p_inbox";

      const updatedProjects = state.projects.map((project) => {
        if (project.id === targetProjectId) {
          const clonedProject = Project.fromJSON(project.toJSON());
          clonedProject.addTodoId(restoredTodo.id);
          return clonedProject;
        }
        return project;
      });

      return {
        ...state,
        todos: {
          ...state.todos,
          [restoredTodo.id]: restoredTodo,
        },
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

    case ActionTypes.PROJECT_RENAMED: {
      const { id, name } = action.payload;

      const updatedProjects = state.projects.map((project) => {
        if (project.id === id) {
          const clonedProject = Project.fromJSON(project.toJSON());
          clonedProject.rename(name);
          return clonedProject;
        }
        return project;
      });

      return {
        ...state,
        projects: updatedProjects,
      };
    }

    case ActionTypes.PROJECT_DELETED: {
      const { id } = action.payload;

      const remainingProjects = state.projects.filter((p) => p.id !== id);

      const deletedProject = state.projects.find((p) => p.id === id);
      const todoIdsToDelete = deletedProject ? deletedProject.todoIds : [];

      const remainingTodos = { ...state.todos };
      todoIdsToDelete.forEach((todoId) => {
        delete remainingTodos[todoId];
      });

      return {
        ...state,
        projects: remainingProjects,
        todos: remainingTodos,
      };
    }

    case ActionTypes.PROJECT_RESTORED: {
      const { projectData, todos } = action.payload;
      if (state.projects.some((p) => p.id === projectData.id)) {
        return state;
      }

      const restoredProject = Project.fromJSON(projectData);
      const restoredTodosMap = Object.fromEntries(
        (todos ?? []).map((todoData) => {
          const todo = Todo.fromJSON(todoData);
          return [todo.id, todo];
        }),
      );

      return {
        ...state,
        projects: [...state.projects, restoredProject],
        todos: {
          ...state.todos,
          ...restoredTodosMap,
        },
      };
    }

    case ActionTypes.SET_ACTIVE_VIEW: {
      return {
        ...state,
        activeView: action.payload,
      };
    }

    case ActionTypes.TODO_SELECTED: {
      return {
        ...state,
        selectedTodoId: action.payload.id,
      };
    }

    case ActionTypes.TODO_DESELECTED: {
      return {
        ...state,
        selectedTodoId: null,
      };
    }

    case ActionTypes.SET_FILTER: {
      return {
        ...state,
        filter: action.payload,
      };
    }

    default:
      return state;
  }
}
