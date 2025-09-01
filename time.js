export let timer = 0;
export let timerInterval = null;

/**
 * Starts the timer and calls back into game.js to update HUD.
 * @param {function} callback - function to call each second with updated timer value.
 */
export function startTimer(callback) {
  timer = 0;
  timerInterval = setInterval(() => {
    timer++;
    if (callback) callback(timer); // let game.js decide how to display
  }, 1000);
}

export function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}
