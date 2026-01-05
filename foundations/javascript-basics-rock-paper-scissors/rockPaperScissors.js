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

function getHumanChoice() {
    return prompt("Enter your choice (rock, paper, or scissors):");
}

function playGame() {
    let humanScore = 0;
    let computerScore = 0;

    function playRound(humanChoice, computerChoice) {
        const human = humanChoice.toLowerCase();
        const computer = computerChoice.toLowerCase();

        if (human === computer) {
            console.log("It's a tie!");
            return;
        }

        if (
            (human === 'rock' && computer === 'scissors') ||
            (human === 'scissors' && computer === 'paper') ||
            (human === 'paper' && computer === 'rock')
        ) {
            humanScore++;
            console.log(`You win! ${human} beats ${computer}.`);
        } else {
            computerScore++;
            console.log(`You lose! ${computer} beats ${human}.`);
        }
    }

    for (let i = 1; i <= 5; i++) {
        console.log(`\nRound ${i}:`);
        const humanSelection = getHumanChoice();
        const computerSelection = getComputerChoice();
        playRound(humanSelection, computerSelection);
        console.log(`Score - You: ${humanScore}, Computer: ${computerScore}`);
    }

    console.log("\n=== Game Over ===");
    if (humanScore > computerScore) {
        console.log(`You won the game! Final score: ${humanScore} - ${computerScore}`);
    } else if (computerScore > humanScore) {
        console.log(`Computer won the game! Final score: ${humanScore} - ${computerScore}`);
    } else {
        console.log(`It's a tie game! Final score: ${humanScore} - ${computerScore}`);
    }
}

playGame();
