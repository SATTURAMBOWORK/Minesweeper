import {
  adjacentMines,
  bfs,
  showAffectedCells,
  pressNeighbors,
  releaseNeighbors,
} from "./gamelogic.js";
import { startTimer, stopTimer, timer, timerInterval } from "./time.js";
import { triggerExplosion } from "./explosion.js";
import { setHighScore,getHighScore,updateHighScoreDisplay } from "./score.js";

let gameOver = false;

document.getElementById("game").addEventListener("contextmenu", e => e.preventDefault());

// --- Difficulty Settings ---
const level = localStorage.getItem("minesweeper-level") || "beginner";
let rows, cols, mineCount, sizeAttr;

if (level === "intermediate") {
  rows = 16; cols = 16; mineCount = 40; sizeAttr = "medium";
} else if (level === "expert") {
  rows = 16; cols = 30; mineCount = 99; sizeAttr = "large";
} else {
  rows = 9; cols = 9; mineCount = 10; sizeAttr = "small";
}

let totalFlags = mineCount;



// --- HUD Update: Timer ---
function updateTimerDisplay() {
  const timerEl = document.getElementById("timer");
  if (!timerEl) return;

  timerEl.textContent = timer;

  // Pulse animation
  timerEl.classList.add("digit-update");
  setTimeout(() => timerEl.classList.remove("digit-update"), 250);

  // Critical warning if time > 999
  if (timer > 999) {
    timerEl.parentElement.classList.add("hud-critical");
  } else {
    timerEl.parentElement.classList.remove("hud-critical");
  }
}

// --- Render game ---
function renderGamePage() {
  let html = `
    <div class="wrap">
      <div class="header">
        <div id="left">⏱ <span id="timer">0</span></div>
        <button id="restart">🙂</button>
        <div id="right">
          🚩 <span id="flagCount">${totalFlags}</span> | 🏆 <span id="highscore">--</span>
        </div>
      </div>
      <div class="board-wrapper">
        <div class="board" data-size="${sizeAttr}" 
             style="grid-template-columns: repeat(${cols}, var(--size));">
          ${'<div class="cell"></div>'.repeat(rows * cols)}
        </div>
      </div>
    </div>
  `;
  document.getElementById("game").innerHTML = html;

  // Restart
  document.getElementById("restart").addEventListener("click", () => {
    gameOver=false;
    stopTimer();
    totalFlags = mineCount;
    document.getElementById("restart").textContent = "🙂";
    renderGamePage();
  });


// Add first-click listeners
document.querySelectorAll(".cell").forEach(cell => {
  // Desktop: left click reveal
  cell.addEventListener("click", firstClickHandler);

  // Desktop: right click flag
  cell.addEventListener("contextmenu", e => {
    e.preventDefault();
    toggleFlag(cell);
  });

  // Mobile: touch support
  let touchTimer;
  cell.addEventListener("touchstart", e => {
    e.preventDefault(); // prevent scrolling
    touchTimer = setTimeout(() => {
      toggleFlag(cell); // long press = flag
      touchTimer = null;
    }, 500); // 0.5s hold
  });

  cell.addEventListener("touchend", e => {
    e.preventDefault();
    if (touchTimer) {
      // Short tap = reveal
      clearTimeout(touchTimer);
      touchTimer = null;
      firstClickHandler({ target: cell });
    }
  });
});


  updateHighScoreDisplay(level);
}

// --- First click ---
function firstClickHandler(e) {
  const cells = document.querySelectorAll(".cell");
  const index = Array.from(cells).indexOf(e.target);

  if (!timerInterval) startTimer(updateTimerDisplay);

  placeMines(index);
  revealCell(index);
}

// --- Place mines ---
function placeMines(firstClickIndex) {
  let mines = new Set();
  while (mines.size < mineCount) {
    let randomNum = Math.floor(Math.random() * rows * cols);
    if (randomNum !== firstClickIndex) mines.add(randomNum);
  }

  document.querySelectorAll(".cell").forEach((cell, i) => {
    if (mines.has(i)) cell.classList.add("mine");
  });

  const cells = document.querySelectorAll(".cell");
  removeEvents();

  const adj = adjacentMines(cells, rows, cols);
  adj.forEach((num, i) => cells[i].dataset.number = num);

  cells.forEach((cell, i) => {
    cell.addEventListener("click", () => revealCell(i));
  });
}

// --- Remove first click ---
function removeEvents() {
  document.querySelectorAll(".cell").forEach(cell =>
    cell.removeEventListener("click", firstClickHandler)
  );
}

// --- Reveal a cell ---
function revealCell(index) {
    
   if (gameOver) return; // prevent further actions if game ended

  const cells = document.querySelectorAll(".cell");
  const cell = cells[index];

  if (cell.classList.contains("flagged") || cell.classList.contains("revealed")) return;
  cell.classList.add("revealed");

  if (cell.classList.contains("mine")) {
    cell.textContent = "💣";
    cell.classList.add("exploded");
    triggerExplosion(cell);
    playExplosionSound();

      stopTimer();         // stop the timer
  gameOver = true;     // set gameOver

    // 🔥 Add shake effect to game container
    const gameContainer = document.getElementById("game");
    gameContainer.classList.add("shake");
    setTimeout(() => gameContainer.classList.remove("shake"), 400);

    
    cells.forEach(c => {
      if (c.classList.contains("mine")) {
        c.textContent = "💣";
        c.classList.add("GameLost");
      }
    });
    cells.forEach(c => {
      if (c.classList.contains("flagged") && !c.classList.contains("mine")) {
        c.textContent = "❌";
        c.classList.add("wrong-flag");
      }
    });
    // Set game over emoji
document.getElementById("restart").textContent = "😵";
  } else {
    const num = cell.dataset.number;
    if (num === "0") {
      bfs(cells, index, chordCell, rows, cols);
      cell.textContent = "";
    } else {
      cell.textContent = num;
      if (!cell.dataset.bound) {
        cell.addEventListener("click", () => showAffectedCells(index, rows, cols));
        cell.addEventListener("mousedown", () => pressNeighbors(index, rows, cols));
        cell.addEventListener("mouseup", () => {
          releaseNeighbors();
          chordCell(index);
        });
        cell.addEventListener("mouseleave", releaseNeighbors);
        cell.dataset.bound = "true";
      }
    }
  }

  // Check win
  const allRevealed = Array.from(cells).every(
    c => c.classList.contains("mine") || c.classList.contains("revealed")
  );
  if (allRevealed) {
    stopTimer();
    gameOver=true;

    console.log("🎉 WIN detected!");
document.querySelector(".board").classList.add("celebration");

    

    // Celebration background
    document.querySelector(".board").classList.add("celebration");

    // Turn mines into stars
    cells.forEach(c => {
      if (c.classList.contains("mine") && !c.classList.contains("exploded")) {
        c.classList.remove("mine", "flagged");
        c.textContent = "";
        c.classList.add("victory-mine");
      }
      if (c.classList.contains("revealed")) {
        c.classList.add("victory-cell");
      }
    });

    document.getElementById("restart").textContent = "😎";

    // check high score
    const prev = getHighScore(level);
    if (!prev || timer < prev) {
      setHighScore(level, timer);
      alert("🎉 New High Score: " + timer + "s!");
    }
    updateHighScoreDisplay(level);
  }
}

// --- Flags ---
function toggleFlag(cell) {
  if (gameOver) return; // 🚫 stop flags after game over
  if (cell.classList.contains("revealed")) return;
  if (cell.classList.contains("flagged")) {
    cell.classList.remove("flagged");
    cell.textContent = "";
    totalFlags++;
  } else {
    if (totalFlags > 0) {
      cell.classList.add("flagged");
      cell.textContent = "🚩";
      totalFlags--;
    }
  }

  const flagEl = document.getElementById("flagCount");
  flagEl.textContent = totalFlags;

  // Pulse animation
  flagEl.classList.add("digit-update");
  setTimeout(() => flagEl.classList.remove("digit-update"), 250);

  // Critical warning
  if (totalFlags < 0) {
    flagEl.parentElement.classList.add("hud-critical");
  } else {
    flagEl.parentElement.classList.remove("hud-critical");
  }
}

// --- Chording ---
function chordCell(index) {
  if (gameOver) return; // 🚫 block chording after game over
  const cells = document.querySelectorAll(".cell");
  const cell = cells[index];
  if (!cell.classList.contains("revealed")) return;

  const num = parseInt(cell.dataset.number, 10);
  if (isNaN(num) || num === 0) return;

  const row = Math.floor(index / cols);
  const col = index % cols;
  const directions = [
    [-1,-1], [-1,0], [-1,1],
    [0,-1],        [0,1],
    [1,-1], [1,0], [1,1]
  ];

  let flagged = 0;
  let hiddenNeighbors = [];
  directions.forEach(([dr,dc]) => {
    const r = row + dr, c = col + dc;
    if (r>=0 && r<rows && c>=0 && c<cols) {
      const nIdx = r*cols+c;
      const nCell = cells[nIdx];
      if (nCell.classList.contains("flagged")) flagged++;
      else if (!nCell.classList.contains("revealed")) hiddenNeighbors.push(nIdx);
    }
  });

  if (flagged === num) {
    hiddenNeighbors.forEach(nIdx => revealCell(nIdx));
  }
}

// --- Sound ---
const explosionSound = new Audio("sounds/explosion-312361.mp3");
explosionSound.volume = 0.7;

export function playExplosionSound() {
  explosionSound.currentTime = 0;
  explosionSound.play();
}

// --- Start ---
renderGamePage();
