import "./style.css";

const content = document.getElementById("content");

const title = document.createElement("h1");
title.textContent = "Todo List";

const subtitle = document.createElement("p");
subtitle.textContent = "Webpack is working — start building your app in src/";

content.append(title, subtitle);
