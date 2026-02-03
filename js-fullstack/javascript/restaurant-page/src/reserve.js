import "./globals.css";
import "./navbar.css";
import "./reserve.css";

import bgImg from "./assets/images/herobg.jpg";

import dateIcon from "./assets/icons/calendar.svg";
import clockIcon from "./assets/icons/clock.svg";
import guestsIcon from "./assets/icons/users.svg";

export default function loadReserve() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const reservePage = document.createElement("div");
  reservePage.classList.add("reserve-page");

  reservePage.style.backgroundImage = `url(${bgImg})`;
  reservePage.style.backgroundSize = "cover";
  reservePage.style.backgroundPosition = "center";
  reservePage.style.backgroundRepeat = "no-repeat";
  reservePage.style.minHeight = "100vh";
  
  const reserveContainer = document.createElement("div");
  reserveContainer.classList.add("reserve-container");

  const yurtHeading = document.createElement("h1");
  yurtHeading.textContent = "YURT";
  reserveContainer.appendChild(yurtHeading);

  const mainHeading = document.createElement("h2");
  mainHeading.textContent = "Reserve Your Table";
  reserveContainer.appendChild(mainHeading);

  const subtitle = document.createElement("p");
  subtitle.classList.add("reserve-subtitle");
  subtitle.textContent =
    "Book your table and experience the warmth of Central Asian hospitality";
  reserveContainer.appendChild(subtitle);

  const form = document.createElement("form");
  form.classList.add("reserve-form");

  const dateGroup = createInputGroup(
    "SELECT DATE",
    "date",
    dateIcon,
    "Select a date",
  );
  form.appendChild(dateGroup);

  const timeGroup = createSelectGroup("SELECT TIME", clockIcon, [
    "Choose a time",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
  ]);
  form.appendChild(timeGroup);

  const guestsGroup = createSelectGroup("NUMBER OF GUESTS", guestsIcon, [
    "1 guest",
    "2 guests",
    "3 guests",
    "4 guests",
    "5 guests",
    "6 guests",
    "7 guests",
    "8 guests",
    "9 guests",
    "10+ guests",
  ]);
  form.appendChild(guestsGroup);

  const submitSection = document.createElement("div");
  submitSection.classList.add("submit-section");

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.classList.add("reserve-button");
  submitButton.textContent = "REQUEST RESERVATION";
  submitSection.appendChild(submitButton);

  const confirmationText = document.createElement("p");
  confirmationText.classList.add("confirmation-text");
  confirmationText.textContent =
    "We'll confirm your reservation within 24 hours";
  submitSection.appendChild(confirmationText);

  form.appendChild(submitSection);
  reserveContainer.appendChild(form);

  const footer = document.createElement("div");
  footer.classList.add("reserve-footer");

  const footerText = document.createElement("p");
  footerText.textContent = "Questions? Contact us directly";
  footer.appendChild(footerText);

  const contactLinks = document.createElement("div");
  contactLinks.classList.add("contact-links");

  const phoneLink = document.createElement("a");
  phoneLink.href = "tel:+85259396413";
  phoneLink.textContent = "+852 5939 6413";
  contactLinks.appendChild(phoneLink);

  const emailLink = document.createElement("a");
  emailLink.href = "mailto:salem@yurthk.com";
  emailLink.textContent = "salem@yurthk.com";
  contactLinks.appendChild(emailLink);

  footer.appendChild(contactLinks);
  reserveContainer.appendChild(footer);

  reservePage.appendChild(reserveContainer);
  content.appendChild(reservePage);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Reservation request submitted!");
  });
}

function createInputGroup(label, type, iconSrc, placeholder) {
  const group = document.createElement("div");
  group.classList.add("input-group");

  const labelElement = document.createElement("label");
  const icon = document.createElement("img");
  icon.src = iconSrc;
  icon.alt = label;
  labelElement.appendChild(icon);

  const labelText = document.createElement("span");
  labelText.textContent = label;
  labelElement.appendChild(labelText);

  group.appendChild(labelElement);

  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  input.required = true;
  group.appendChild(input);

  return group;
}

function createSelectGroup(label, iconSrc, options) {
  const group = document.createElement("div");
  group.classList.add("input-group");

  const labelElement = document.createElement("label");
  const icon = document.createElement("img");
  icon.src = iconSrc;
  icon.alt = label;
  labelElement.appendChild(icon);

  const labelText = document.createElement("span");
  labelText.textContent = label;
  labelElement.appendChild(labelText);

  group.appendChild(labelElement);

  const select = document.createElement("select");
  select.required = true;

  options.forEach((optionText, index) => {
    const option = document.createElement("option");
    option.value = index === 0 ? "" : optionText;
    option.textContent = optionText;
    if (index === 0) option.disabled = true;
    select.appendChild(option);
  });

  group.appendChild(select);

  return group;
}
