function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

function operate(operator, a, b) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
    case "%":
      return a % b;
    default:
      return null;
  }
}

let firstNumber = "";
let secondNumber = "";
let currentOperator = null;
let shouldReset = false;

const display = document.querySelector("input");
const numberButtons = document.querySelectorAll("button:not(.operation)");
const operatorButtons = document.querySelectorAll(
  ".add, .sub, .mul, .div, .mod"
);
const equalsButton = document.querySelector(".eq");
const clearButton = document.querySelector(".clear");
const deleteButton = document.querySelector(".delete");

function updateDisplay(value) {
  display.value = value;
}

function clear() {
  firstNumber = "";
  secondNumber = "";
  currentOperator = null;
  shouldReset = false;
  updateDisplay("0");
}

function deleteLast() {
  if (shouldReset) return;
  display.value = display.value.slice(0, -1) || "0";
}

function appendNumber(number) {
  if (shouldReset) {
    display.value = "";
    shouldReset = false;
  }

  if (number === "." && display.value.includes(".")) return;

  if (display.value === "0" && number !== ".") {
    display.value = number;
  } else {
    display.value += number;
  }
}

function handleOperator(operator) {
  const currentValue = parseFloat(display.value);

  if (currentOperator !== null && !shouldReset) {
    secondNumber = currentValue;

    if (currentOperator === "/" && secondNumber === 0) {
      alert("Can't divide by zero");
      clear();
      return;
    }

    const result = operate(currentOperator, firstNumber, secondNumber);
    const roundedResult = Math.round(result * 100000000) / 100000000;
    updateDisplay(roundedResult);
    firstNumber = roundedResult;
  } else {
    firstNumber = currentValue;
  }

  currentOperator = operator;
  shouldReset = true;
}

function handleEquals() {
  if (currentOperator === null || shouldReset) return;

  secondNumber = parseFloat(display.value);

  if (currentOperator === "/" && secondNumber === 0) {
    alert("Can't divide by zero");
    clear();
    return;
  }

  const result = operate(currentOperator, firstNumber, secondNumber);
  const roundedResult = Math.round(result * 100000000) / 100000000;
  updateDisplay(roundedResult);

  firstNumber = roundedResult;
  currentOperator = null;
  shouldReset = true;
}

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    appendNumber(button.textContent);
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleOperator(button.textContent);
  });
});

equalsButton.addEventListener("click", handleEquals);

clearButton.addEventListener("click", clear);

deleteButton.addEventListener("click", deleteLast);

clear();
