import loadHome from "./home.js";
import loadMenu from "./menu.js";
import loadContact from "./contact.js";
import loadReserve from "./reserve.js";

function setActiveButton(activeBtn) {
  const buttons = document.querySelectorAll("nav button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function handleNavbarScroll() {
  const header = document.querySelector("header");
  const hero = document.querySelector(".hero");
  const contactPage = document.querySelector(".contact-page");
  const menuPage = document.querySelector(".menu-page");
  const reservePage = document.querySelector(".reserve-page");

  if (contactPage || reservePage) {
    header.classList.remove("scrolled");
    return;
  }

  if (menuPage) {
    header.classList.add("scrolled");
    return;
  }

  if (!hero) {
    header.classList.add("scrolled");
    return;
  }

  const heroHeight = hero.offsetHeight;

  if (window.scrollY > heroHeight - 80) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", handleNavbarScroll);

loadHome();

const homeBtn = document.querySelector("nav button:nth-of-type(1)");
const menuBtn = document.querySelector("nav button:nth-of-type(2)");
const contactBtn = document.querySelector("nav button:nth-of-type(3)");

setActiveButton(homeBtn);
handleNavbarScroll();

homeBtn.addEventListener("click", () => {
  loadHome();
  setActiveButton(homeBtn);
  handleNavbarScroll();
});

menuBtn.addEventListener("click", () => {
  loadMenu();
  setActiveButton(menuBtn);
  handleNavbarScroll();
});

contactBtn.addEventListener("click", () => {
  loadContact();
  setActiveButton(contactBtn);
  handleNavbarScroll();
});

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "hero-reserve-btn") {
    loadReserve();
    setActiveButton(null);
    handleNavbarScroll();
  }
});
