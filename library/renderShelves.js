import {
  CM_TO_PX,
  bookshelfRowHeightCM,
  bookshelfRowWidthCM,
  bookshelvesNumber,
} from "./constants.js";

export function createAddBookButton() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "book add-book";
  btn.setAttribute("aria-label", "Add book");
  return btn;
}

export function renderShelves() {
  const shelvesEl = document.querySelector(".shelves");
  if (!shelvesEl) return;

  shelvesEl.innerHTML = "";

  const shelfWidthPx = bookshelfRowWidthCM * CM_TO_PX;
  const shelfRowHeightPx = bookshelfRowHeightCM * CM_TO_PX;

  for (let i = 0; i < bookshelvesNumber; i++) {
    const shelfRow = document.createElement("div");
    shelfRow.className = "shelf-row";
    shelfRow.style.width = `${shelfWidthPx}px`;
    shelfRow.style.height = `${shelfRowHeightPx}px`;

    const shelfBack = document.createElement("div");
    shelfBack.className = "shelf-back";

    const shelfCeiling = document.createElement("div");
    shelfCeiling.className = "shelf-ceiling";

    const shelfFloor = document.createElement("div");
    shelfFloor.className = "shelf-floor";

    const shelfLeft = document.createElement("div");
    shelfLeft.className = "shelf-left";

    const shelfRight = document.createElement("div");
    shelfRight.className = "shelf-right";

    const shelfBooks = document.createElement("div");
    shelfBooks.className = "shelf-books";

    shelfRow.appendChild(shelfBack);
    shelfRow.appendChild(shelfCeiling);
    shelfRow.appendChild(shelfFloor);
    shelfRow.appendChild(shelfLeft);
    shelfRow.appendChild(shelfRight);
    shelfRow.appendChild(shelfBooks);

    shelvesEl.appendChild(shelfRow);
  }
}
