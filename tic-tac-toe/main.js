const Gameboard = (() => {
  const board = Array(9).fill("");

  const getBoard = () => board.slice();

  const setMark = (index, mark) => {
    if (board[index] !== "") return false;
    board[index] = mark;
    return true;
  };

  const reset = () => {
    board.fill("");
  };

  return { getBoard, setMark, reset };
})();

const Player = (name, mark) => ({ name, mark });

const GameController = (() => {
  let players = [Player("Player 1", "X"), Player("Player 2", "O")];
  let activePlayer = players[0];
  let gameOver = false;

  const getActivePlayer = () => activePlayer;
  const isGameOver = () => gameOver;

  const switchPlayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const setPlayers = (name1, name2) => {
    players = [
      Player(name1 || "Player 1", "X"),
      Player(name2 || "Player 2", "O"),
    ];
    activePlayer = players[0];
  };

  const getWinner = (board) => {
    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const playRound = (index) => {
    if (gameOver) return { status: "over" };

    const placed = Gameboard.setMark(index, activePlayer.mark);
    if (!placed) return { status: "invalid" };

    const board = Gameboard.getBoard();
    const winnerMark = getWinner(board);
    const isTie = board.every((cell) => cell !== "");

    if (winnerMark) {
      gameOver = true;
      const winner = players.find((p) => p.mark === winnerMark);
      return { status: "win", winner };
    }

    if (isTie) {
      gameOver = true;
      return { status: "tie" };
    }

    switchPlayer();
    return { status: "continue" };
  };

  const resetGame = () => {
    Gameboard.reset();
    activePlayer = players[0];
    gameOver = false;
  };

  return {
    getActivePlayer,
    isGameOver,
    playRound,
    resetGame,
    setPlayers,
  };
})();

const DisplayController = (() => {
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("start");
  const player1Input = document.getElementById("player-1");
  const player2Input = document.getElementById("player-2");

  const render = () => {
    const board = Gameboard.getBoard();
    boardEl.innerHTML = "";

    board.forEach((mark, index) => {
      const cell = document.createElement("button");
      cell.classList.add("cell");
      cell.dataset.index = index;
      cell.textContent = mark;
      if (mark || GameController.isGameOver()) cell.classList.add("disabled");
      boardEl.appendChild(cell);
    });
  };

  const updateStatus = (message) => {
    statusEl.textContent = message;
  };

  const handleCellClick = (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;

    const index = Number(cell.dataset.index);
    const result = GameController.playRound(index);

    render();

    if (result.status === "win") {
      updateStatus(`${result.winner.name} wins!`);
    } else if (result.status === "tie") {
      updateStatus("It’s a tie!");
    } else if (result.status === "continue") {
      updateStatus(`${GameController.getActivePlayer().name}’s turn`);
    }
  };

  const handleStart = () => {
    GameController.setPlayers(player1Input.value, player2Input.value);
    GameController.resetGame();
    render();
    updateStatus(`${GameController.getActivePlayer().name}’s turn`);
  };

  const bindEvents = () => {
    boardEl.addEventListener("click", handleCellClick);
    startBtn.addEventListener("click", handleStart);
  };

  bindEvents();
  render();

  return { render };
})();
