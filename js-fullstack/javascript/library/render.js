import { CM_TO_PX, bookshelfRowHeightCM } from "./constants.js";
import { createBookEl } from "./book.js";
import { library } from "./library.js";
import { createAddBookButton } from "./shelves.js";

export function renderBooks() {
  const shelfBookAreas = document.querySelectorAll(".shelf-books");
  if (!shelfBookAreas.length) return;

  shelfBookAreas.forEach((area) => (area.innerHTML = ""));

  let shelfIndex = 0;
  let currentWidth = 0;
  let lastShelfIndex = 0;

  const maxWidth = shelfBookAreas[0].clientWidth;

  library.forEach((book) => {
    const bookEl = createBookEl(book);
    const bookWidth =
      bookEl.getBoundingClientRect().width || book.thicknessCM * CM_TO_PX;

    if (currentWidth + bookWidth > maxWidth) {
      shelfIndex += 1;
      currentWidth = 0;
    }

    if (!shelfBookAreas[shelfIndex]) return;

    shelfBookAreas[shelfIndex].appendChild(bookEl);
    currentWidth += bookWidth;
    lastShelfIndex = shelfIndex;
  });

  const addButton = createAddBookButton();
  const addBookThicknessCM = 5;
  const addBookHeightCM = bookshelfRowHeightCM - 8;
  addButton.style.width = `${addBookThicknessCM * CM_TO_PX}px`;
  addButton.style.height = `${addBookHeightCM * CM_TO_PX}px`;
  const targetShelfIndex = library.length ? lastShelfIndex : 0;
  const targetShelf = shelfBookAreas[targetShelfIndex];
  if (targetShelf) {
    targetShelf.appendChild(addButton);
  }
}
