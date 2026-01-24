import { renderShelves } from "./renderShelves.js";
import { renderBooks } from "./renderBooks.js";
import { seedLibrary, library } from "./library.js";
import { initModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  seedLibrary();
  renderShelves();
  renderBooks();
  initModal();

  library.forEach((book) => {
    console.log(book.info());
  });
});
