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

  const contactPage = document.createElement("div");
  contactPage.classList.add("contact-page");

  const heroSection = document.createElement("section");
  heroSection.classList.add("contact-hero");

  const heroHeading = document.createElement("h2");
  heroHeading.textContent = "Contact Us";
  heroSection.appendChild(heroHeading);

  const heroText = document.createElement("div");
  heroText.classList.add("hero-text");

  const heroParagraph1 = document.createElement("p");
  heroParagraph1.textContent =
    "Got feedback, an idea, a collaboration or a reservation request? Drop us a line.";
  heroText.appendChild(heroParagraph1);

  const heroParagraph2 = document.createElement("p");
  heroParagraph2.textContent = "We promise, a human will reply, not a bot.";
  heroText.appendChild(heroParagraph2);

  heroSection.appendChild(heroText);
  contactPage.appendChild(heroSection);

  const contactCardsSection = document.createElement("section");
  contactCardsSection.classList.add("contact-cards");

  const locationCard = createContactCard(
    locationIcon,
    "Location",
    ["32 Elgin Street", "Soho, Central", "Hong Kong"],
    false,
  );
  contactCardsSection.appendChild(locationCard);

  const phoneCard = createContactCard(
    phoneIcon,
    "Phone",
    ["+852 5939 6413"],
    true,
  );
  contactCardsSection.appendChild(phoneCard);

  const emailCard = createContactCard(
    mailIcon,
    "Email",
    ["salem@yurthk.com"],
    true,
  );
  contactCardsSection.appendChild(emailCard);

  const hoursCard = createContactCard(
    clockIcon,
    "Hours",
    ["Daily", "12 PM – 10 PM"],
    false,
  );
  contactCardsSection.appendChild(hoursCard);

  contactPage.appendChild(contactCardsSection);

  const mapSection = document.createElement("section");
  mapSection.classList.add("map-section");

  const mapContainer = document.createElement("div");
  mapContainer.classList.add("map-container");

  const mapIframe = document.createElement("iframe");
  mapIframe.src =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d230.74395124124416!2d114.15229561291585!3d22.281655627039616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404016d0b865aed%3A0x609398adb0856686!2sYurt!5e0!3m2!1sen!2skz!4v1770141283546!5m2!1sen!2skz";
  mapIframe.width = "600";
  mapIframe.height = "450";
  mapIframe.style.border = "0";
  mapIframe.allowFullscreen = true;
  mapIframe.loading = "lazy";
  mapIframe.referrerPolicy = "no-referrer-when-downgrade";
  mapIframe.title = "Yurt Restaurant Location";
  mapContainer.appendChild(mapIframe);

  mapSection.appendChild(mapContainer);
  contactPage.appendChild(mapSection);

  content.appendChild(contactPage);
}

function createContactCard(iconSrc, title, lines, isLink = false) {
  const card = document.createElement("div");
  card.classList.add("contact-card");

  const iconCircle = document.createElement("div");
  iconCircle.classList.add("icon-circle");
  const icon = document.createElement("img");
  icon.src = iconSrc;
  icon.alt = title;
  iconCircle.appendChild(icon);
  card.appendChild(iconCircle);

  const cardTitle = document.createElement("h3");
  cardTitle.textContent = title;
  card.appendChild(cardTitle);

  const cardContent = document.createElement("div");
  cardContent.classList.add("card-content");

  lines.forEach((line) => {
    if (isLink) {
      const link = document.createElement("a");
      link.href = title === "Phone" ? `tel:${line}` : `mailto:${line}`;
      link.textContent = line;
      cardContent.appendChild(link);
    } else {
      const p = document.createElement("p");
      p.textContent = line;
      cardContent.appendChild(p);
    }
  });

  card.appendChild(cardContent);
  return card;
}
