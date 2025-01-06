const ROWS = 6;
const COLS = 7;

let board = [];
let currentPlayer = "red"; // Spieler startet
const gameBoard = document.getElementById("game-board");
const statusText = document.getElementById("status");

function createBoard() {
    gameBoard.innerHTML = "";
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            gameBoard.appendChild(cell);
        }
    }

    gameBoard.addEventListener("click", handlePlayerMove);
}

function handlePlayerMove(e) {
    if (!e.target.classList.contains("cell")) return;

    const col = parseInt(e.target.dataset.col);
    const row = dropDisc(col);

    if (row === null) {
        alert("Diese Spalte ist voll!");
        return;
    }

    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    placeDisc(cell, currentPlayer);
    board[row][col] = currentPlayer;

    if (checkWin(row, col)) {
        statusText.textContent = `Spieler (Rot) hat gewonnen!`;
        gameBoard.removeEventListener("click", handlePlayerMove);
        return;
    }

    currentPlayer = "yellow";
    statusText.textContent = "Der Computer (Gelb) ist dran...";
    gameBoard.removeEventListener("click", handlePlayerMove);

    setTimeout(computerMove, 500);
}

function dropDisc(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
            return row;
        }
    }
    return null;
}

function placeDisc(cell, color) {
    const disc = document.createElement("div");
    disc.classList.add("disc", color);
    cell.appendChild(disc);
}

function computerMove() {
    let col = findBestMove();
    let row = dropDisc(col);

    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    placeDisc(cell, currentPlayer);
    board[row][col] = currentPlayer;

    if (checkWin(row, col)) {
        statusText.textContent = "Der Computer (Gelb) hat gewonnen!";
        return;
    }

    currentPlayer = "red";
    statusText.textContent = "Spieler (Rot) ist dran!";
    gameBoard.addEventListener("click", handlePlayerMove);
}

function findBestMove() {
    // 1. Gewinnzug setzen, wenn möglich
    for (let col = 0; col < COLS; col++) {
        const row = dropDisc(col);
        if (row !== null) {
            board[row][col] = "yellow";
            if (checkWin(row, col)) {
                board[row][col] = null;
                return col; // Gewinnzug
            }
            board[row][col] = null;
        }
    }

    // 2. Verhindern, dass Spieler gewinnt (horizontal, vertikal)
    for (let col = 0; col < COLS; col++) {
        const row = dropDisc(col);
        if (row !== null) {
            board[row][col] = "red";
            if (checkWin(row, col)) {
                board[row][col] = null;
                return col; // Blockiere Sieg
            }
            board[row][col] = null;
        }
    }

    // 3. Blockiere vertikale Bedrohungen (drei übereinander)
    for (let col = 0; col < COLS; col++) {
        for (let row = 2; row < ROWS; row++) {
            if (
                board[row][col] === "red" &&
                board[row - 1][col] === "red" &&
                board[row - 2][col] === "red" &&
                board[row - 3][col] === null
            ) {
                return col; // Setze den Stein direkt über die drei roten Steine
            }
        }
    }

    // 4. Blockiere horizontale Bedrohungen (zwei nebeneinander)
    for (let row = ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < COLS - 2; col++) {
            if (
                board[row][col] === "red" &&
                board[row][col + 1] === "red"
            ) {
                // Blockiere rechts
                if (col + 2 < COLS && board[row][col + 2] === null && dropDisc(col + 2) === row) {
                    return col + 2;
                }
                // Blockiere links
                if (col - 1 >= 0 && board[row][col - 1] === null && dropDisc(col - 1) === row) {
                    return col - 1;
                }
            }
        }
    }

    // 5. Spalten in der Mitte bevorzugen
    const middle = Math.floor(COLS / 2);
    if (dropDisc(middle) !== null) {
        return middle;
    }

    // 6. Zufällige Spalte
    let randomCol;
    do {
        randomCol = Math.floor(Math.random() * COLS);
    } while (dropDisc(randomCol) === null);
    return randomCol;
}

function checkWin(row, col) {
    const directions = [
        { r: 0, c: 1 },  // Horizontal
        { r: 1, c: 0 },  // Vertikal
        { r: 1, c: 1 },  // Diagonal rechts unten
        { r: 1, c: -1 }  // Diagonal links unten
    ];

    for (let { r, c } of directions) {
        let count = 1;
        count += countDirection(row, col, r, c);
        count += countDirection(row, col, -r, -c);

        if (count >= 4) {
            return true;
        }
    }

    return false;
}

function countDirection(row, col, rowInc, colInc) {
    let count = 0;

    for (let i = 1; i < 4; i++) {
        const newRow = row + rowInc * i;
        const newCol = col + colInc * i;

        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === currentPlayer) {
            count++;
        } else {
            break;
        }
    }

    return count;
}

function resetGame() {
    currentPlayer = "red";
    statusText.textContent = "Spieler (Rot) ist dran!";
    createBoard();
}

createBoard();
