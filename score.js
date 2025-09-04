// --- High Scores ---
export function getHighScore(level) {
  return localStorage.getItem("minesweeper-highscore-" + level);
}

 export function setHighScore(level, time) {
  localStorage.setItem("minesweeper-highscore-" + level, time);
}

export function updateHighScoreDisplay() {
  const el = document.getElementById("highscore");
  const score = getHighScore(level);
  el.textContent = score ? score + "s" : "--";
}
