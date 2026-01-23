const library = [];
const bookshelfHeightCM = 30; // cm
const bookshelvesNumber = 5; // levels
const bookshelfLengthCM = 80; // cm

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
    Math.random() * (bookshelfHeightCM - 2 - bookshelfHeightCM - 12) +
    bookshelfHeightCM -
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
