import { renderShelves } from "./renderShelves.js";
import { renderBooks } from "./renderBooks.js";
import { seedLibrary, library } from "./library.js";

document.addEventListener("DOMContentLoaded", () => {
  seedLibrary();
  renderShelves();
  renderBooks();

  library.forEach((book) => {
    console.log(book.info());
  });
});
