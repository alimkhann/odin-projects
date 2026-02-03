import "./globals.css";
import "./navbar.css";
import "./menu.css";

export default function loadMenu() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const menuSection = document.createElement("section");
  menuSection.classList.add("menu-section");

  const menuHeading = document.createElement("h2");
  menuHeading.textContent = "Our Menu";
  menuSection.appendChild(menuHeading);

  content.appendChild(menuSection);
}
