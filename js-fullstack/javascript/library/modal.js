import { addBookToLibrary } from "./library.js";
import { renderBooks } from "./renderBooks.js";

export function initModal() {
  const dialog = document.querySelector(".add-book-dialog");
  const form = document.querySelector(".add-book-form");
  const cancelBtn = document.querySelector(".cancel-add-book");

  if (!dialog || !form) return;

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".add-book");
    if (!addBtn) return;
    dialog.showModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const title = data.get("title");
    const author = data.get("author");
    const pages = Number(data.get("pages"));
    const haveRead = data.get("haveRead") === "on";

    addBookToLibrary(title, author, pages, haveRead);
    renderBooks();

    dialog.close();
    form.reset();
  });

  cancelBtn?.addEventListener("click", () => {
    dialog.close();
    form.reset();
  });
}
