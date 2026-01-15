const body = document.querySelector("body");

const buttonContainer = document.createElement("div");
buttonContainer.className = "button-container";

const changeGridButton = document.createElement("button");
changeGridButton.textContent = "Change Grid Size";
changeGridButton.id = "promptGridSize";

const clearButton = document.createElement("button");
clearButton.textContent = "Clear Canvas";
clearButton.id = "clearCanvas";

const opacityToggleButton = document.createElement("button");
opacityToggleButton.textContent = "Opacity Effect: ON";
opacityToggleButton.id = "opacityToggle";

const grid = document.createElement("div");
grid.className = "grid";

buttonContainer.appendChild(changeGridButton);
buttonContainer.appendChild(clearButton);
buttonContainer.appendChild(opacityToggleButton);
body.appendChild(buttonContainer);
body.appendChild(grid);

let isMouseDown = false;
let isRightClick = false;
let opacityEffectEnabled = true;

document.addEventListener("mousedown", (e) => {
  isMouseDown = true;
  if (e.button === 2) {
    isRightClick = true;
  }
});

document.addEventListener("mouseup", () => {
  isMouseDown = false;
  isRightClick = false;
});

grid.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

function rgb(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

function createGrid(size) {
  grid.innerHTML = "";

  const squareSize = 960 / size;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const square = document.createElement("div");
      square.className = "square";
      square.style.width = `${squareSize}px`;
      square.style.height = `${squareSize}px`;
      square.dataset.interactions = "0";

      const applyColor = () => {
        let interactions = parseInt(square.dataset.interactions);

        if (opacityEffectEnabled) {
          if (interactions < 10) {
            interactions++;
            square.dataset.interactions = interactions;

            const opacity = interactions * 0.1;

            if (interactions === 1) {
              const r = Math.floor(Math.random() * 256);
              const g = Math.floor(Math.random() * 256);
              const b = Math.floor(Math.random() * 256);
              square.dataset.color = `${r},${g},${b}`;
            }

            const [r, g, b] = square.dataset.color.split(",");
            square.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          }
        } else {
          const r = Math.floor(Math.random() * 256);
          const g = Math.floor(Math.random() * 256);
          const b = Math.floor(Math.random() * 256);
          square.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
      };

      square.addEventListener("mouseenter", () => {
        if (isMouseDown) {
          if (isRightClick) {
            square.style.backgroundColor = "black";
            square.dataset.interactions = "0";
          } else {
            applyColor();
          }
        }
      });

      square.addEventListener("click", (e) => {
        if (e.button === 0) {
          applyColor();
        }
      });

      square.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        square.style.backgroundColor = "black";
        square.dataset.interactions = "0";
      });
      grid.appendChild(square);
    }
  }
}

changeGridButton.addEventListener("click", () => {
  let newSize = prompt("Enter the number of squares per side (max 100):");
  newSize = parseInt(newSize);

  if (newSize && newSize > 0 && newSize <= 100) {
    createGrid(newSize);
  } else {
    alert("Please enter a valid number between 1 and 100");
  }
});

clearButton.addEventListener("click", () => {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    square.style.backgroundColor = "black";
    square.dataset.interactions = "0";
  });
});

opacityToggleButton.addEventListener("click", () => {
  opacityEffectEnabled = !opacityEffectEnabled;
  opacityToggleButton.textContent = `Opacity Effect: ${
    opacityEffectEnabled ? "ON" : "OFF"
  }`;
});

createGrid(32);
