document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const resetBtn = document.getElementById("reset-btn");
    const backHomeBtn = document.getElementById("back-home");
    const toggleModeBtn = document.getElementById("toggle-mode");
    const msgContainer = document.getElementById("msg-container");
    const msg = document.getElementById("msg");
    const playerScoreEl = document.getElementById("player-score");
    const aiScoreEl = document.getElementById("ai-score");
    const drawScoreEl = document.getElementById("draw-score");
    
    let turnO = true, gameActive = true;
    let playerScore = 0, aiScore = 0, drawScore = 0;
    let gameMode = localStorage.getItem("gridSize") || "3x3";
    let isFriendMode = localStorage.getItem("gameMode") === "Friend";
    let difficulty = localStorage.getItem("difficulty") || "Hard";
    let boxes = [];

    // 🎵 Load Sound Files
const clickSound = new Audio("click.mp3");
const winSound = new Audio("win.mp3");
const drawSound = new Audio("draw.mp3");

// ✅ Ensure sounds only play after a user interacts with the page
let soundsEnabled = false;

document.body.addEventListener("click", () => {
    if (!soundsEnabled) {
        clickSound.play().then(() => {
            console.log("🔊 Sound Enabled!");
            soundsEnabled = true;
        }).catch(err => console.warn("🔇 Audio Play Blocked:", err));

        winSound.play().catch(() => {});
        drawSound.play().catch(() => {});
    }
}, { once: true });

// ✅ Function to play sounds only when enabled
function playSound(sound) {
    if (soundsEnabled) {
        sound.currentTime = 0;
        sound.play().catch(err => console.warn("🔇 Audio Play Error:", err));
    }
}

    console.log("Sound Debug:", clickSound, winSound, drawSound);

    
    function createBoard() {
        gameBoard.innerHTML = "";
        let size = gameMode === "3x3" ? 3 : 4;
        gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        for (let i = 0; i < size * size; i++) {
            let box = document.createElement("button");
            box.classList.add("box");
            box.addEventListener("click", handleBoxClick);
            gameBoard.appendChild(box);
        }
        boxes = document.querySelectorAll(".box");
        resetGame();
    }

    function handleBoxClick(event) {
        if (!gameActive || event.target.innerText) return;
        event.target.innerText = "O";
        event.target.disabled = true;
        playSound(clickSound);
        
        if (checkWinner()) return;

        if (!isFriendMode) {
            setTimeout(computerMove, 500);
        } else {
            turnO = !turnO;
        }
    }

    function computerMove() {
        if (!gameActive) return;
        let emptyBoxes = [...boxes].filter(box => !box.innerText);
        if (emptyBoxes.length === 0) return;

        let selectedBox;
        if (difficulty === "Hard") {
            selectedBox = getBestMove();
        } else {
            selectedBox = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
        }

        selectedBox.innerText = "X";
        selectedBox.disabled = true;
        playSound(clickSound);
        
        checkWinner();
    }

    function getBestMove() {
        let emptyBoxes = [...boxes].filter(box => !box.innerText);
        return emptyBoxes.length > 0 ? emptyBoxes[0] : null;
    }

    function checkWinner() {
        let size = gameMode === "3x3" ? 3 : 4;
        let winPatterns = generateWinPatterns(size);
        
        for (let pattern of winPatterns) {
            let values = pattern.map(index => boxes[index].innerText);
            if (values.every(v => v === "O") || values.every(v => v === "X")) {
                showWinner(values[0]);
                return true;
            }
        }

        if ([...boxes].every(box => box.innerText)) {
            showDraw();
            return true;
        }
        return false;
    }

    function generateWinPatterns(size) {
        let winPatterns = [];
        for (let i = 0; i < size; i++) {
            winPatterns.push([...Array(size)].map((_, j) => i * size + j));
            winPatterns.push([...Array(size)].map((_, j) => j * size + i));
        }
        winPatterns.push([...Array(size)].map((_, i) => i * (size + 1)));
        winPatterns.push([...Array(size)].map((_, i) => (i + 1) * (size - 1)));
        return winPatterns;
    }

    function showWinner(winner) {
        msg.innerHTML = `🎉 ${winner} Wins! 🎉`;
        msgContainer.classList.add("show");
        gameActive = false;
        
        if (winner === "O") playerScore++;
        else aiScore++;

        playSound(winSound);
        updateScores();
        setTimeout(resetGame, 3000);
    }

    function showDraw() {
        msg.innerHTML = `😃 It's a Draw!`;
        msgContainer.classList.add("show");
        drawScore++;
        playSound(drawSound);
        updateScores();
        setTimeout(resetGame, 3000);
    }

    function updateScores() {
        playerScoreEl.innerText = playerScore;
        aiScoreEl.innerText = aiScore;
        drawScoreEl.innerText = drawScore;
    }

    function resetGame() {
        turnO = true;
        gameActive = true;
        msgContainer.classList.remove("show");
        boxes.forEach(box => {
            box.innerText = "";
            box.disabled = false;
        });
    }

    toggleModeBtn.addEventListener("click", () => {
        gameMode = gameMode === "3x3" ? "4x4" : "3x3";
        localStorage.setItem("gridSize", gameMode);
        toggleModeBtn.innerText = `Switch to ${gameMode === "3x3" ? "4x4" : "3x3"}`;
        createBoard();
    });

    resetBtn.addEventListener("click", resetGame);
    backHomeBtn.addEventListener("click", () => window.location.href = "index.html");

    createBoard();
});
