import { Book } from "./book.js";

export const library = [];

export function addBookToLibrary(title, author, pages, haveRead) {
  library.push(new Book(title, author, pages, haveRead));
}

export function seedLibrary() {
  if (library.length) return;

  addBookToLibrary("The Pragmatic Programmer", "Andrew Hunt", 352, true);
  addBookToLibrary("Clean Code", "Robert C. Martin", 464, true);
  addBookToLibrary("Eloquent JavaScript", "Marijn Haverbeke", 472, false);
  addBookToLibrary("You Don't Know JS Yet", "Kyle Simpson", 278, false);
  addBookToLibrary("Refactoring", "Martin Fowler", 448, true);
}
