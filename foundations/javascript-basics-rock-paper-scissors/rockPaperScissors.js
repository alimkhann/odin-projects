function getComputerChoice() {
  const random = Math.floor(Math.random() * 3);
  if (random === 0) {
    return "rock";
  } else if (random === 1) {
    return "paper";
  } else {
    return "scissors";
  }
}

let humanScore = 0;
let computerScore = 0;
let roundCounter = 1;

function playRound(humanChoice, computerChoice) {
  if (humanChoice === computerChoice) {
    roundCounter++;
    return "It's a tie!";
  }

  if (
    (humanChoice === "rock" && computerChoice === "scissors") ||
    (humanChoice === "scissors" && computerChoice === "paper") ||
    (humanChoice === "paper" && computerChoice === "rock")
  ) {
    humanScore++;
    roundCounter++;
    return `You win! ${humanChoice} beats ${computerChoice}.`;
  } else {
    computerScore++;
    roundCounter++;
    return `You lose! ${computerChoice} beats ${humanChoice}.`;
  }
}

const buttons = document.querySelectorAll("button");
const content = document.querySelector(".content");
const roundCounterDiv = document.querySelector(".roundCounter");
const humanScoreDiv = document.querySelector(".humanScore");
const computerScoreDiv = document.querySelector(".computerScore");
const roundResult = document.querySelector(".roundResult");
const gameResult = document.querySelector(".game");

roundCounterDiv.textContent = `Round: ${roundCounter}/5`;
humanScoreDiv.textContent = `Human: ${humanScore}`;
computerScoreDiv.textContent = `Computer: ${computerScore}`;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (roundCounter === 5) {
      buttons.forEach((button) => (button.disabled = true));
      gameResult.style.display = "flex";
      gameResult.style.justifyContent = "center";
      gameResult.style.alignItems = "center";

      if (humanScore > computerScore) {
        gameResult.innerHTML = `Game Over<br>You won the game!<br>Final score: ${humanScore} - ${computerScore}`;
      } else if (computerScore > humanScore) {
        gameResult.innerHTML = `Game Over<br>Computer won the game!<br>Final score: ${humanScore} - ${computerScore}`;
      } else {
        gameResult.innerHTML = `Game Over<br>It's a tie game!<br>Final score: ${humanScore} - ${computerScore}`;
      }

      const playAgainButton = document.createElement("button");
      playAgainButton.textContent = "Play Again";
      playAgainButton.addEventListener("click", () => location.reload());
      content.appendChild(playAgainButton);
    }

    roundResult.textContent = playRound(button.id, getComputerChoice());
    roundCounterDiv.textContent = `Round: ${roundCounter}/5`;
    humanScoreDiv.textContent = `Human: ${humanScore}`;
    computerScoreDiv.textContent = `Computer: ${computerScore}`;
  });
});
