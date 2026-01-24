import { addBookToLibrary, library } from "./library.js";
import { renderBooks } from "./renderBooks.js";
import { calculateBookThickness } from "./book.js";

export function initModal() {
  const dialog = document.querySelector(".add-book-dialog");
  const form = document.querySelector(".add-book-form");
  const titleEl = form?.querySelector("h3");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const cancelBtn = document.querySelector(".cancel-add-book");
  const deleteBtn = document.querySelector(".delete-book");
  const closeBtn = document.querySelector(".close-dialog");
  const confirmDialog = document.querySelector(".confirm-delete-dialog");
  const confirmYes = document.querySelector(".confirm-yes");
  const confirmNo = document.querySelector(".confirm-no");

  if (!dialog || !form) return;

  const setMode = (mode) => {
    if (!titleEl || !submitBtn || !deleteBtn) return;

    if (mode === "edit") {
      titleEl.textContent = "Edit book";
      submitBtn.textContent = "Save";
      deleteBtn.hidden = false;
      deleteBtn.classList.add("danger");
    } else {
      titleEl.textContent = "Add book";
      submitBtn.textContent = "Add";
      deleteBtn.hidden = true;
      deleteBtn.classList.remove("danger");
      delete form.dataset.editingId;
    }
  };

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".add-book");
    if (!addBtn) return;
    form.reset();
    setMode("add");
    dialog.showModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const editingId = form.dataset.editingId;

    const data = new FormData(form);
    const title = data.get("title");
    const author = data.get("author");
    const pages = Number(data.get("pages"));
    const haveRead = data.get("haveRead") === "on";

    if (editingId) {
      const book = library.find((b) => b.id === editingId);
      if (book) {
        book.title = title;
        book.author = author;
        book.pageCount = pages;
        book.haveRead = haveRead;
        book.thicknessCM = calculateBookThickness(pages);
      }
      delete form.dataset.editingId;
    } else {
      addBookToLibrary(title, author, pages, haveRead);
    }

    renderBooks();

    dialog.close();
    form.reset();
    setMode("add");
  });

  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-book");
    if (!editBtn) return;

    const bookEl = editBtn.closest(".book");
    const id = bookEl?.dataset.id;
    const book = library.find((b) => b.id === id);
    if (!book) return;

    form.dataset.editingId = id;
    form.elements.title.value = book.title;
    form.elements.author.value = book.author;
    form.elements.pages.value = book.pageCount;
    form.elements.haveRead.checked = book.haveRead;
    setMode("edit");

    dialog.showModal();
  });

  deleteBtn?.addEventListener("click", () => {
    const id = form.dataset.editingId;
    if (!id) return;
    confirmDialog?.showModal();
  });

  confirmYes?.addEventListener("click", () => {
    const id = form.dataset.editingId;
    if (!id) return;
    const index = library.findIndex((b) => b.id === id);
    if (index !== -1) library.splice(index, 1);
    renderBooks();
    confirmDialog?.close();
    dialog.close();
    form.reset();
    setMode("add");
  });

  confirmNo?.addEventListener("click", () => {
    confirmDialog?.close();
  });

  cancelBtn?.addEventListener("click", () => {
    dialog.close();
    form.reset();
    setMode("add");
  });

  closeBtn?.addEventListener("click", () => {
    dialog.close();
    form.reset();
    setMode("add");
  });

  dialog.addEventListener("click", (e) => {
    if (e.target !== dialog) return;
    dialog.close();
    form.reset();
    setMode("add");
  });

  confirmDialog?.addEventListener("click", (e) => {
    if (e.target !== confirmDialog) return;
    confirmDialog.close();
  });
}
