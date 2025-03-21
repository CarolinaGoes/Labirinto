const size = 20;
let width = parseInt(size);
let height = parseInt(size);

const scale = width < 75 ? 1 : 2;
const blockWidth = width < 75 ? 20 : 14;
const blockHeight = height < 75 ? 20 : 14;

const start = { x: 0, y: 0 };
const end = { x: width - 1, y: height - 1 };

let finished = false;
let moves = 0;
let movesEl = document.querySelector('#moves-span');
let timeElement = document.querySelector('#time-span');
let path = [start];
let cells = [];
let context;

let chestImg = new Image();
chestImg.src = 'heart.png'; 
chestImg.onload = drawAll;

function generateNewMaze() {
  finished = false;
  moves = 0;
  if (movesEl) movesEl.innerHTML = moves;

  path = [start];
  setup();
  resetTimer();
  drawAll();
}

function resetMaze() {
  finished = false;
  moves = 0;
  if (movesEl) movesEl.innerHTML = moves;

  path = [start];
  resetTimer();
  drawAll();
}

function newMaze(x, y) {
  const totalCells = x * y;
  const cells = Array.from({ length: y }, () => Array.from({ length: x }, () => [0, 0, 0, 0]));
  const unvisited = Array.from({ length: y }, () => Array.from({ length: x }, () => true));

  let currentCell = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)];
  const path = [currentCell];
  unvisited[currentCell[0]][currentCell[1]] = false;
  let visited = 1;

  while (visited < totalCells) {
    const neighbors = [
      [currentCell[0] - 1, currentCell[1], 0, 2],
      [currentCell[0], currentCell[1] + 1, 1, 3],
      [currentCell[0] + 1, currentCell[1], 2, 0],
      [currentCell[0], currentCell[1] - 1, 3, 1],
    ].filter(([y, x]) => y >= 0 && y < height && x >= 0 && x < width && unvisited[y][x]);

    if (neighbors.length) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      cells[currentCell[0]][currentCell[1]][next[2]] = 1;
      cells[next[0]][next[1]][next[3]] = 1;
      unvisited[next[0]][next[1]] = false;
      visited++;
      currentCell = [next[0], next[1]];
      path.push(currentCell);
    } else {
      currentCell = path.pop();
    }
  }

  return cells;
}

function setup() {
  cells = newMaze(width, height);
}

function preDraw() {
  const canvas = document.querySelector("#canvas");
  context = canvas.getContext("2d");

  canvas.width = width * blockWidth * scale;
  canvas.height = height * blockHeight * scale;
  context.scale(scale, scale);
  context.lineWidth = scale * 2;
}

function draw() {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = cells[y][x];
      if (cell[0] === 0) {
        context.beginPath();
        context.moveTo(x * blockWidth, y * blockHeight);
        context.lineTo((x + 1) * blockWidth, y * blockHeight);
        context.stroke();
      }
      if (cell[1] === 0) {
        context.beginPath();
        context.moveTo((x + 1) * blockWidth, y * blockHeight);
        context.lineTo((x + 1) * blockWidth, (y + 1) * blockHeight);
        context.stroke();
      }
      if (cell[2] === 0) {
        context.beginPath();
        context.moveTo(x * blockWidth, (y + 1) * blockHeight);
        context.lineTo((x + 1) * blockWidth, (y + 1) * blockHeight);
        context.stroke();
      }
      if (cell[3] === 0) {
        context.beginPath();
        context.moveTo(x * blockWidth, y * blockHeight);
        context.lineTo(x * blockWidth, (y + 1) * blockHeight);
        context.stroke();
      }
    }
  }
}

function drawPath() {
  path.forEach(({ x, y }) => {
    context.fillStyle = "#ff0000";
    context.fillRect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
  });

  
  context.imageSmoothingEnabled = false;
  const margin = -5; 
  const adjustedWidth = blockWidth - margin * 2;
  const adjustedHeight = blockHeight - margin * 2; 
  context.drawImage(
    chestImg,
    end.x * blockWidth + margin, 
    end.y * blockHeight + margin, 
    adjustedWidth, 
    adjustedHeight 
  );
}

function drawAll() {
  preDraw();
  draw();
  drawPath();
}

function tryMove(direction) {
  if (finished) return;

  const lastPos = path[path.length - 1];
  const currentCell = cells[lastPos.y][lastPos.x];
  let newPos;

  if (direction === "down" && currentCell[2] !== 0) newPos = { x: lastPos.x, y: lastPos.y + 1 };
  if (direction === "up" && currentCell[0] !== 0) newPos = { x: lastPos.x, y: lastPos.y - 1 };
  if (direction === "right" && currentCell[1] !== 0) newPos = { x: lastPos.x + 1, y: lastPos.y };
  if (direction === "left" && currentCell[3] !== 0) newPos = { x: lastPos.x - 1, y: lastPos.y };

  if (newPos) {
    if (path.length > 1 && newPos.x === path[path.length - 2].x && newPos.y === path[path.length - 2].y) {
      path.pop();
    } else {
      path.push(newPos);
    }

    moves++;
    if (movesEl) movesEl.innerHTML = moves;

    drawAll();

    if (newPos.x === end.x && newPos.y === end.y) win();
  }
}

function resetTimer() {
  victoryModal.classList.add('hidden');
}

function win() {
  finished = true;
  if (victoryMovesEl) victoryMovesEl.innerHTML = moves;
  if (victoryModal) victoryModal.classList.remove('hidden');
}

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowDown") tryMove("down");
  if (e.key === "ArrowUp") tryMove("up");
  if (e.key === "ArrowRight") tryMove("right");
  if (e.key === "ArrowLeft") tryMove("left");
});

document.querySelector('#new-maze')?.addEventListener('click', generateNewMaze);
document.querySelector('#reset-maze')?.addEventListener('click', resetMaze);

setup();
drawAll();


