import "./globals.css";
import "./navbar.css";
import "./contact.css";

import locationIcon from "./assets/icons/map-pin.svg";
import phoneIcon from "./assets/icons/phone.svg";
import mailIcon from "./assets/icons/mail.svg";
import clockIcon from "./assets/icons/clock.svg";

export default function loadContact() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const contactSection = document.createElement("section");
  contactSection.classList.add("contact-section");

  const contactHeading = document.createElement("h2");
  contactHeading.textContent = "Contact Us";
  contactSection.appendChild(contactHeading);

  content.appendChild(contactSection);
}
