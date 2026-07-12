import "./styles.css";
import { greeting } from "./greeting.js";
import img from "./images.jpeg"

console.log(greeting);

const image = document.createElement("img");
image.src = img;

document.body.appendChild(image);
