import "./globals.css";
import "./navbar.css";
import "./reserve.css";

import dateIcon from "./assets/icons/calendar.svg";
import clockIcon from "./assets/icons/clock.svg";
import guestsIcon from "./assets/icons/users.svg";

export default function loadReserve() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const reserveSection = document.createElement("section");
  reserveSection.classList.add("reserve-section");

  const reserveHeading = document.createElement("h2");
  reserveHeading.textContent = "Make a Reservation";
  reserveSection.appendChild(reserveHeading);

  content.appendChild(reserveSection);
}
