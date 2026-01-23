const library = [];
const bookshelfRowHeightCM = 30; // cm
const bookshelvesNumber = 5; // levels
const bookshelfLengthCM = 80; // cm
const bookshelfRowWidthCM = bookshelfLengthCM;

const CM_TO_PX = 4;

function renderShelves() {
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

const randomRgbColor = () => {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  return `rgb(${red}, ${green}, ${blue})`;
};

function calculateBookThickness(pageCount, paperThicknessCM = 0.12) {
  const bookThickness = (pageCount / 2) * paperThicknessCM;
  return parseFloat(bookThickness.toFixed(2));
}

function Book(title, author, pageCount, haveRead) {
  if (!new.target) {
    throw Error("You must use the 'new' operator to call the constructor");
  }

  this.id = crypto.randomUUID();

  this.title = title;
  this.author = author;
  this.pageCount = pageCount;
  this.haveRead = haveRead;

  this.thickness = calculateBookThickness(pageCount);
  this.heightCM = (
    Math.random() * (bookshelfRowHeightCM - 2 - bookshelfRowHeightCM - 12) +
    bookshelfRowHeightCM -
    12
  ).toFixed(1);
  this.color = randomRgbColor();

  this.info = function () {
    if (this.haveRead) {
      return `${this.title} by ${this.author}, ${this.pageCount} pages, read`;
    } else {
      return `${this.title} by ${this.author}, ${this.pageCount} pages, not read yet`;
    }
  };
}

function addBookToLibrary(title, author, pages, haveRead) {
  library.push(new Book(title, author, pages, haveRead));
}

addBookToLibrary("The Pragmatic Programmer", "Andrew Hunt", 352, true);
addBookToLibrary("Clean Code", "Robert C. Martin", 464, true);
addBookToLibrary("Eloquent JavaScript", "Marijn Haverbeke", 472, false);
addBookToLibrary("You Don't Know JS Yet", "Kyle Simpson", 278, false);
addBookToLibrary("Refactoring", "Martin Fowler", 448, true);

library.forEach((book) => {
  console.log(book.info());
});

document.addEventListener("DOMContentLoaded", () => {
  renderShelves();
});
