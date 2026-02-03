import "./globals.css";
import "./navbar.css";
import "./menu.css";

export default function loadMenu() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  // Main menu page wrapper
  const menuPage = document.createElement("div");
  menuPage.classList.add("menu-page");

  // TASTING MENU Section
  const tastingSection = document.createElement("section");
  tastingSection.classList.add("menu-section");

  const tastingHeader = document.createElement("div");
  tastingHeader.classList.add("section-header");
  const tastingTitle = document.createElement("h2");
  tastingTitle.textContent = "TASTING MENU";
  const tastingPrice = document.createElement("p");
  tastingPrice.classList.add("section-price");
  tastingPrice.textContent = "488 PER PERSON + 10% SERVICE CHARGE";
  tastingHeader.appendChild(tastingTitle);
  tastingHeader.appendChild(tastingPrice);
  tastingSection.appendChild(tastingHeader);

  // TO START
  const toStart1 = createMenuSubsection("TO START", [
    { name: "BAURSAK", description: "truffle sauce | shrimp" },
    { name: "ACHICHUK", description: "cherry tomatoes | quinoa | red grapes" },
    {
      name: "SEA COURSE",
      description: "seabass | pumpkin | mung bean purée",
    },
  ]);
  tastingSection.appendChild(toStart1);

  // MAIN COURSE
  const mainCourse1 = createMenuSubsection(
    "MAIN COURSE",
    [
      {
        name: "PILAF",
        description: "beef | jasmine rice | raisins | quail egg",
        note: "Choose one",
      },
      {
        name: "BESHBARMAK",
        description:
          "homemade noodle parcels | potato | carrot | +90 for horse meat sausage",
        extra: "served with traditional hot sorpa",
      },
      {
        name: "DOLMA",
        description:
          "eggplant | zucchini | traditional cheese foam | carrot paste",
      },
    ],
    true,
  );
  tastingSection.appendChild(mainCourse1);

  // PALETTE CLEANSER
  const paletteCleanser = createMenuSubsection("PALETTE CLEANSER: ICE CREAM", [
    { description: "lemon | lavender" },
  ]);
  tastingSection.appendChild(paletteCleanser);

  // DESSERT
  const dessert1 = createMenuSubsection(
    "DESSERT",
    [
      {
        name: "APORT",
        description: "green apple | cheesecake | caramel",
        note: "Choose one",
      },
      {
        name: "SHELPEK",
        description: "cherry | puff pastry | homemade ice cream",
      },
      {
        name: "PETIT FOURS: ARQYT",
        description: "regional handmade treats",
      },
    ],
    true,
  );
  tastingSection.appendChild(dessert1);

  menuPage.appendChild(tastingSection);

  // Divider
  const divider1 = document.createElement("div");
  divider1.classList.add("menu-divider");
  menuPage.appendChild(divider1);

  // A LA CARTE Section
  const alaCarteSection = document.createElement("section");
  alaCarteSection.classList.add("menu-section");

  const alaCarteTitle = document.createElement("h2");
  alaCarteTitle.textContent = "A LA CARTE";
  alaCarteSection.appendChild(alaCarteTitle);

  // TO START (À la carte)
  const toStart2 = createMenuSubsection("TO START", [
    { name: "BAURSAK", description: "homemade fried dough | 55" },
    {
      name: "ACHICHUK",
      description: "cherry tomatoes | quinoa | red grapes | 98",
    },
    {
      name: "SEA COURSE",
      description: "seabass | pumpkin | mung bean purée | 88",
    },
  ]);
  alaCarteSection.appendChild(toStart2);

  // MAIN COURSE (À la carte)
  const mainCourse2 = createMenuSubsection("MAIN COURSE", [
    {
      name: "PILAF",
      description: "beef | jasmine rice | raisins | quail egg | 140",
    },
    {
      name: "BESHBARMAK",
      description: "homemade noodle parcels | potato | carrot | 140",
      extra: "+90 for horse meat sausage | served with traditional hot sorpa",
    },
    {
      name: "DOLMA",
      description:
        "eggplant | zucchini | traditional cheese foam | carrot paste | 125",
    },
  ]);
  alaCarteSection.appendChild(mainCourse2);

  // DESSERT (À la carte)
  const dessert2 = createMenuSubsection("DESSERT", [
    { name: "APORT", description: "green apple | cheesecake | caramel | 108" },
    {
      name: "SHELPEK",
      description: "cherry | puff pastry | homemade ice cream | 108",
    },
    { name: "SARQYT", description: "regional handmade treats | 45" },
  ]);
  alaCarteSection.appendChild(dessert2);

  menuPage.appendChild(alaCarteSection);

  // Divider
  const divider2 = document.createElement("div");
  divider2.classList.add("menu-divider");
  menuPage.appendChild(divider2);

  // BEVERAGES Section
  const beveragesSection = document.createElement("section");
  beveragesSection.classList.add("menu-section");

  const beveragesTitle = document.createElement("h2");
  beveragesTitle.textContent = "BEVERAGES";
  beveragesSection.appendChild(beveragesTitle);

  // OUR SPECIALTIES
  const specialties = createMenuSubsection("OUR SPECIALTIES", [
    { description: "Bukhara Spritz | 78" },
    { description: "Almaty Nights | 78" },
    { description: "Samarkand Spice | 78" },
  ]);
  beveragesSection.appendChild(specialties);

  // SPARKLING TEAS
  const sparklingTeas = createMenuSubsection("SPARKLING TEAS", [
    {
      description:
        "Saicho Sparkling Tea 2024 (Hojicha, Jasmine, Darjeeling) 88 | 398",
    },
    {
      description: "Noughty Dealcoholized Sparkling Chardonnay 98 | 398",
    },
    { description: "Noughty Dealcoholized Sparkling Rose 98 | 398" },
    { description: "Mindful Sparks Noble Truth 78 | 388" },
  ]);
  beveragesSection.appendChild(sparklingTeas);

  // TEAS
  const teas = createMenuSubsection("TEAS", [
    { description: "Tary Tea | 88" },
    { description: "Tashkent Tea | 88" },
  ]);
  beveragesSection.appendChild(teas);

  menuPage.appendChild(beveragesSection);

  content.appendChild(menuPage);
}

// Helper function to create menu subsections
function createMenuSubsection(title, items, showNote = false) {
  const subsection = document.createElement("div");
  subsection.classList.add("menu-subsection");

  const subsectionTitle = document.createElement("h3");
  subsectionTitle.textContent = title;
  subsection.appendChild(subsectionTitle);

  const itemsContainer = document.createElement("div");
  itemsContainer.classList.add("menu-items");

  items.forEach((item, index) => {
    if (showNote && index === 0 && item.note) {
      const note = document.createElement("p");
      note.classList.add("menu-note");
      note.textContent = item.note;
      itemsContainer.appendChild(note);
    }

    const menuItem = document.createElement("div");
    menuItem.classList.add("menu-item");

    if (item.name) {
      const itemName = document.createElement("h5");
      itemName.textContent = item.name;
      menuItem.appendChild(itemName);
    }

    if (item.description) {
      const itemDesc = document.createElement("p");
      itemDesc.classList.add("item-description");
      itemDesc.textContent = item.description;
      menuItem.appendChild(itemDesc);
    }

    if (item.extra) {
      const itemExtra = document.createElement("p");
      itemExtra.classList.add("item-extra");
      itemExtra.textContent = item.extra;
      menuItem.appendChild(itemExtra);
    }

    itemsContainer.appendChild(menuItem);
  });

  subsection.appendChild(itemsContainer);
  return subsection;
}
