// 🔹 Calculate adjacent mine numbers
export function adjacentMines(cells, rows, cols) {
  let arr = [];

  cells.forEach((cell, index) => {
    let cnt = 0;
    let row = Math.floor(index / cols);
    let col = index % cols;

    // check all 8 directions
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue;

        let nr = row + r;
        let nc = col + c;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          let neighborIndex = nr * cols + nc;
          if (cells[neighborIndex].classList.contains("mine")) {
            cnt++;
          }
        }
      }
    }

    arr.push(cnt);
  });

  return arr;
}

// 🔹 BFS expansion (flood fill)
export function bfs(cells, index, chordCellCb, rows, cols) {
  let row = Math.floor(index / cols);
  let col = index % cols;
  floodFill(cells, index, row, col, chordCellCb, rows, cols);
}

function floodFill(cells, index, row, col, chordCellCb, rows, cols) {
  let vis = Array.from({ length: rows }, () => Array(cols).fill(0));
  vis[row][col] = 1;
  let q = [[row, col]];

  while (q.length) {
    let [frow, fcol] = q.shift();
    let cellIndex = frow * cols + fcol;
    let cell = cells[cellIndex];

    if (!cell.classList.contains("revealed")) {
      cell.classList.add("revealed");
      let num = cell.dataset.number;
      cell.textContent = num === "0" ? "" : num;

      if (num !== "0" && !cell.dataset.bound) {
        cell.addEventListener("click", () => showAffectedCells(cellIndex, rows, cols));
        cell.addEventListener("mousedown", () => pressNeighbors(cellIndex, rows, cols));
        cell.addEventListener("mouseup", () => {
          releaseNeighbors();
          chordCellCb(cellIndex);
        });
        cell.addEventListener("mouseleave", releaseNeighbors);
        cell.dataset.bound = "true";
      }
    }

    // explore neighbors...
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        let nrow = frow + dr, ncol = fcol + dc;
        if (nrow >= 0 && nrow < rows && ncol >= 0 && ncol < cols) {
          if (vis[nrow][ncol] === 0) {
            let nIdx = nrow * cols + ncol;
            let nCell = cells[nIdx];
            if (nCell.classList.contains("flagged")) continue;

            if (!nCell.classList.contains("revealed")) {
              nCell.classList.add("revealed");
              let num = nCell.dataset.number;
              nCell.textContent = num === "0" ? "" : num;

              if (num !== "0" && !nCell.dataset.bound) {
                nCell.addEventListener("click", () => showAffectedCells(nIdx, rows, cols));
                nCell.addEventListener("mousedown", () => pressNeighbors(nIdx, rows, cols));
                nCell.addEventListener("mouseup", () => {
                  releaseNeighbors();
                  chordCellCb(nIdx);
                });
                nCell.addEventListener("mouseleave", releaseNeighbors);
                nCell.dataset.bound = "true";
              }
            }

            if (nCell.dataset.number === "0" && !nCell.classList.contains("mine")) {
              q.push([nrow, ncol]);
            }
            vis[nrow][ncol] = 1;
          }
        }
      }
    }
  }
}

// 🔹 Neighbor press/release for chording visual
export function pressNeighbors(index, rows, cols) {
  let cells = document.querySelectorAll(".cell");
  let row = Math.floor(index / cols);
  let col = index % cols;
  let directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  directions.forEach(([dr, dc]) => {
    let r = row + dr;
    let c = col + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      let neighborIndex = r * cols + c;
      let neighbor = cells[neighborIndex];
      if (!neighbor.classList.contains("revealed") &&
          !neighbor.classList.contains("flagged")) {
        neighbor.classList.add("pressed");
      }
    }
  });
}

export function releaseNeighbors() {
  document.querySelectorAll(".cell.pressed")
    .forEach(c => c.classList.remove("pressed"));
}

// 🔹 Show affected cells (for click highlight and binding chord events)
export function showAffectedCells(index, rows, cols) {
  let cells = document.querySelectorAll(".cell");
  let row = Math.floor(index / cols);
  let col = index % cols;
  let directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  let affected = [];

  directions.forEach(([dr, dc]) => {
    let r = row + dr;
    let c = col + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      let neighborIndex = r * cols + c;
      let neighbor = cells[neighborIndex];
      if (!neighbor.classList.contains("revealed")) {
        affected.push(neighbor);
      }
    }
  });

  console.log(`Cell ${index} affects ${affected.length} hidden cells.`);
}
