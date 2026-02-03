import "./globals.css";
import "./navbar.css";
import "./home.css";

import heroBgImg from "./assets/images/herobg.jpg";
import foodImg from "./assets/images/food.jpeg";

import facebookIcon from "./assets/icons/facebook.svg";
import instagramIcon from "./assets/icons/instagram.svg";
import twitterIcon from "./assets/icons/twitter.svg";
import phoneIcon from "./assets/icons/phone.svg";
import mailIcon from "./assets/icons/mail.svg";
import mapPinIcon from "./assets/icons/map-pin.svg";
import clockIcon from "./assets/icons/clock.svg";

export default function loadHome() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const heroSection = document.createElement("section");
  heroSection.classList.add("hero");
  heroSection.style.backgroundImage = `url(${heroBgImg})`;
  const heroText = document.createElement("div");
  heroText.classList.add("hero-text");
  const heroHeading = document.createElement("h1");
  heroHeading.textContent = "Central Asian cuisine at the\nheart of Hong Kong";
  const heroSubheading = document.createElement("p");
  heroSubheading.textContent = "32 Elgin Street, Soho, Central";
  heroText.appendChild(heroHeading);
  heroText.appendChild(heroSubheading);
  const heroBtn = document.createElement("button");
  heroBtn.textContent = "Make a Reservation";
  heroBtn.id = "hero-reserve-btn";
  heroText.appendChild(heroBtn);
  heroSection.appendChild(heroText);

  const philosophySection = document.createElement("section");
  philosophySection.classList.add("philosophy-section");

  const foodImage = document.createElement("img");
  foodImage.src = foodImg;
  foodImage.alt = "Delicious Central Asian Food";
  foodImage.id = "food-image";
  philosophySection.appendChild(foodImage);
  const philosophyText = document.createElement("div");
  philosophyText.classList.add("philosophy-text");
  const philosophyHeading = document.createElement("h2");
  philosophyHeading.textContent = "Our Philosophy";
  const philosophyParagraph = document.createElement("p");
  philosophyParagraph.textContent =
    '"For centuries, the yurt stood as a beacon of hospitality on the vast steppe. ' +
    "No matter how far the journey, inside, strangers became family. " +
    "That is the spirit we bring to our restaurant - a place where everyone is welcome " +
    'and invited to discover our culture, food and perspective."';

  philosophyText.appendChild(philosophyHeading);
  philosophyText.appendChild(philosophyParagraph);
  philosophySection.appendChild(philosophyText);

  const footerSection = document.createElement("footer");
  footerSection.classList.add("footer");

  const footerContent = document.createElement("div");
  footerContent.classList.add("footer-content");

  // About Us section
  const aboutSection = document.createElement("div");
  aboutSection.classList.add("footer-section");
  const aboutHeading = document.createElement("h3");
  aboutHeading.textContent = "About Us";
  const aboutAddress = document.createElement("p");
  aboutAddress.textContent = "32 Elgin Street, Central";
  const socialIcons = document.createElement("div");
  socialIcons.classList.add("social-icons");

  const facebookLink = document.createElement("a");
  facebookLink.href = "#";
  const facebookImg = document.createElement("img");
  facebookImg.src = facebookIcon;
  facebookImg.alt = "Facebook";
  facebookLink.appendChild(facebookImg);

  const instagramLink = document.createElement("a");
  instagramLink.href = "#";
  const instagramImg = document.createElement("img");
  instagramImg.src = instagramIcon;
  instagramImg.alt = "Instagram";
  instagramLink.appendChild(instagramImg);

  const twitterLink = document.createElement("a");
  twitterLink.href = "#";
  const twitterImg = document.createElement("img");
  twitterImg.src = twitterIcon;
  twitterImg.alt = "Twitter";
  twitterLink.appendChild(twitterImg);

  socialIcons.appendChild(facebookLink);
  socialIcons.appendChild(instagramLink);
  socialIcons.appendChild(twitterLink);

  aboutSection.appendChild(aboutHeading);
  aboutSection.appendChild(aboutAddress);
  aboutSection.appendChild(socialIcons);

  // Quick Links section
  const quickLinksSection = document.createElement("div");
  quickLinksSection.classList.add("footer-section");
  const quickLinksHeading = document.createElement("h3");
  quickLinksHeading.textContent = "Quick Links";
  const quickLinksList = document.createElement("ul");
  const links = ["About Us", "Meet our team", "Latest News", "Contact"];
  links.forEach((link) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = link;
    li.appendChild(a);
    quickLinksList.appendChild(li);
  });
  quickLinksSection.appendChild(quickLinksHeading);
  quickLinksSection.appendChild(quickLinksList);

  // Yurt Info section
  const yurtSection = document.createElement("div");
  yurtSection.classList.add("footer-section");
  const yurtHeading = document.createElement("h3");
  yurtHeading.textContent = "Yurt";

  const phoneInfo = document.createElement("div");
  phoneInfo.classList.add("contact-info");
  const phoneImg = document.createElement("img");
  phoneImg.src = phoneIcon;
  phoneImg.alt = "Phone";
  const phoneText = document.createElement("p");
  phoneText.textContent = "+852 5939 5413";
  phoneInfo.appendChild(phoneImg);
  phoneInfo.appendChild(phoneText);

  const emailInfo = document.createElement("div");
  emailInfo.classList.add("contact-info");
  const mailImg = document.createElement("img");
  mailImg.src = mailIcon;
  mailImg.alt = "Email";
  const emailText = document.createElement("p");
  emailText.textContent = "team@yurte.com";
  emailInfo.appendChild(mailImg);
  emailInfo.appendChild(emailText);

  const addressInfo = document.createElement("div");
  addressInfo.classList.add("contact-info");
  const mapImg = document.createElement("img");
  mapImg.src = mapPinIcon;
  mapImg.alt = "Address";
  const addressText = document.createElement("p");
  addressText.textContent = "32 Elgin Street, Central";
  addressInfo.appendChild(mapImg);
  addressInfo.appendChild(addressText);

  const hoursInfo = document.createElement("div");
  hoursInfo.classList.add("contact-info");
  const clockImg = document.createElement("img");
  clockImg.src = clockIcon;
  clockImg.alt = "Hours";
  const hoursText = document.createElement("p");
  hoursText.textContent = "12 PM - 10 PM";
  hoursInfo.appendChild(clockImg);
  hoursInfo.appendChild(hoursText);

  yurtSection.appendChild(yurtHeading);
  yurtSection.appendChild(phoneInfo);
  yurtSection.appendChild(emailInfo);
  yurtSection.appendChild(addressInfo);
  yurtSection.appendChild(hoursInfo);

  // Newsletter section
  const newsletterSection = document.createElement("div");
  newsletterSection.classList.add("footer-section");
  const newsletterHeading = document.createElement("h3");
  newsletterHeading.textContent = "Newsletter";
  const newsletterText = document.createElement("p");
  newsletterText.classList.add("newsletter-text");
  newsletterText.textContent =
    "Subscribe us & receive up offers and updates you inbox directly";
  const newsletterForm = document.createElement("form");
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.placeholder = "Your email";
  emailInput.required = true;
  const subscribeBtn = document.createElement("button");
  subscribeBtn.type = "submit";
  subscribeBtn.textContent = "Subscribe";
  newsletterForm.appendChild(emailInput);
  newsletterForm.appendChild(subscribeBtn);
  newsletterSection.appendChild(newsletterHeading);
  newsletterSection.appendChild(newsletterText);
  newsletterSection.appendChild(newsletterForm);

  // Append all sections to footer content
  footerContent.appendChild(aboutSection);
  footerContent.appendChild(quickLinksSection);
  footerContent.appendChild(yurtSection);
  footerContent.appendChild(newsletterSection);

  // Footer bottom
  const footerBottom = document.createElement("div");
  footerBottom.classList.add("footer-bottom");
  const copyright = document.createElement("p");
  copyright.textContent = "Website made by Alimkhan Yergebayev";
  const links2 = document.createElement("div");
  const termsLink = document.createElement("a");
  termsLink.href = "#";
  termsLink.textContent = "Terms of use";
  const privacyLink = document.createElement("a");
  privacyLink.href = "#";
  privacyLink.textContent = "Privacy Policy";
  links2.appendChild(termsLink);
  links2.appendChild(document.createTextNode(" | "));
  links2.appendChild(privacyLink);
  footerBottom.appendChild(copyright);
  footerBottom.appendChild(links2);

  footerSection.appendChild(footerContent);
  footerSection.appendChild(footerBottom);
  content.appendChild(heroSection);
  content.appendChild(philosophySection);
  content.appendChild(footerSection);
}
