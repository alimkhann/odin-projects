import { CM_TO_PX, bookshelfRowHeightCM } from "./constants.js";

export const randomRgbColor = () => {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  return `rgb(${red}, ${green}, ${blue})`;
};

export function shadeRgb(rgbString, factor) {
  const match = rgbString.match(/\d+/g);
  if (!match) return rgbString;

  const [r, g, b] = match.map(Number);
  const clamp = (value) => Math.max(0, Math.min(255, value));

  return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)})`;
}

export function calculateBookThickness(pageCount, paperThicknessCM = 0.04) {
  const bookThickness = (pageCount / 2) * paperThicknessCM;
  return parseFloat(bookThickness.toFixed(2));
}

export class Book {
  constructor(title, author, pageCount, haveRead) {
    this.id = crypto.randomUUID();

    this.title = title;
    this.author = author;
    this.pageCount = pageCount;
    this.haveRead = haveRead;

    this.thicknessCM = calculateBookThickness(pageCount);
    const minBookHeightCM = 12;
    const maxBookHeightCM = bookshelfRowHeightCM - 6;
    this.heightCM = (
      Math.random() * (maxBookHeightCM - minBookHeightCM) +
      minBookHeightCM
    ).toFixed(1);
    this.color = randomRgbColor();
  }

  info() {
    if (this.haveRead) {
      return `${this.title} by ${this.author}, ${this.pageCount} pages, read`;
    }
    return `${this.title} by ${this.author}, ${this.pageCount} pages, not read yet`;
  }
}

export function createBookEl(book) {
  const el = document.createElement("div");
  el.className = "book";

  const widthPx = book.thicknessCM * CM_TO_PX;
  const heightPx = book.heightCM * CM_TO_PX;

  el.style.width = `${widthPx}px`;
  el.style.height = `${heightPx}px`;
  const lighter = shadeRgb(book.color, 1.12);
  const darker = shadeRgb(book.color, 0.75);
  el.style.background = `linear-gradient(180deg, ${lighter}, ${book.color} 55%, ${darker})`;
  el.dataset.title = book.title;
  el.dataset.read = book.haveRead ? "true" : "false";

  return el;
}
