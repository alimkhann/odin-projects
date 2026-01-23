import { renderShelves } from "./shelves.js";
import { renderBooks } from "./render.js";
import { seedLibrary, library } from "./library.js";

document.addEventListener("DOMContentLoaded", () => {
  seedLibrary();
  renderShelves();
  renderBooks();

  library.forEach((book) => {
    console.log(book.info());
  });
});
