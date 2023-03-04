// Set up canvas and game board
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cellSize = 20;
const boardWidth = canvas.width / cellSize;
const boardHeight = canvas.height / cellSize;
let snake = [{ x: 5, y: 5 }];
let food = { x: 10, y: 10 };
let direction = "right";
let score = 0;
let roundNumber = 1;

let gameInterval;
const audioCTX = new AudioContext();

// Add a listener for the keydown event on the document object
document.addEventListener(
  "keydown",
  function (event) {
    // Check if the pressed key is an arrow key
    if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      // Start the game
      startGame();
    }
  },
  { once: true }
);
function startGame() {
  gameInterval = setInterval(gameLoop, 100);
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  const droneOsc = audioCTX.createOscillator();
  droneOsc.frequency.value = 130.81;
  droneOsc.start();
  droneOsc.connect(audioCTX.destination);
}

function checkFoodCollision() {
  // Check if snake head is in the same position as the food
  if (snake[0].x === food.x && snake[0].y === food.y) {
    const audioCTX = new AudioContext();
    const osc = audioCTX.createOscillator();
    const gainNode = audioCTX.createGain();
    gainNode.gain.value = 0.3;
    osc.type = "triangle";
    osc.frequency.value = food.noteFrequency;
    osc.start(audioCTX.currentTime);
    osc.stop(audioCTX.currentTime + 0.4);
    osc.connect(gainNode);
    gainNode.connect(audioCTX.destination);
    console.log(food.noteName);
    if (
      cMajorNotes.find((obj) => {
        return obj.note === food.noteName;
      })
    ) {
      updateScore("increment");
    } else {
      console.log("bad");
      if (score > 0) {
        updateScore("decrement");
      }
    }
    // Increase the score, generate new food, and add a new segment to the snake
    generateFood();
    snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y });
  }
}

// Main game loop
function gameLoop() {
  // Update snake position and check for collisions
  const newPosition = calculateNewPosition();
  if (checkCollisions(newPosition)) {
    endGame();
    return;
  }
  snake.unshift(newPosition);
  snake.pop();

  // Check for food collisions and generate new food if needed
  checkFoodCollision();
  drawFood();

  // Redraw game board and update score
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawScore();
  drawFood();
  roundNumber++;
}

// Event listener for Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && food.color === "red") {
    generateFood();
  }
});

// Helper functions for generating random positions and checking collisions
function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * boardWidth),
    y: Math.floor(Math.random() * boardHeight),
  };
}

function checkCollisions(position) {
  // Check for collisions with snake body or game board boundaries
  if (
    position.x < 0 ||
    position.x >= boardWidth ||
    position.y < 0 ||
    position.y >= boardHeight
  ) {
    return true;
  }
  for (let i = 0; i < snake.length; i++) {
    if (position.x === snake[i].x && position.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

function calculateNewPosition() {
  // Calculate new head position based on current direction
  let head = { ...snake[0] };
  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }
  return head;
}

function drawSnake() {
  // Draw each cell of the snake using ctx.fillRect()
  ctx.fillStyle = "white";
  for (let i = 0; i < boardWidth; i++) {
    for (let j = 0; j < boardHeight; j++) {
      ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
  for (let i = 0; i < snake.length; i++) {
    ctx.fillRect(
      snake[i].x * cellSize,
      snake[i].y * cellSize,
      cellSize,
      cellSize
    );
  }
}

function drawFood() {
  // Draw the food using ctx.beginPath() and ctx.arc()
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(
    (food.x + 0.5) * cellSize,
    (food.y + 0.5) * cellSize,
    cellSize / 2,
    0,
    2 * Math.PI
  );
  ctx.fillText(
    food.noteName,
    (food.x + 0.5) * cellSize,
    (food.y + 0.5) * cellSize
  );
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`Score: ${score}`, 10, canvas.height - 10);
}

function updateScore(state) {
  state === "increment" ? score++ : score--;
}

function generateRandNote(goodNotes, badNotes) {
  const goodNote = goodNotes[Math.floor(Math.random() * goodNotes.length)];
  const badNote = badNotes[Math.floor(Math.random() * badNotes.length)];
  const goodAndBadNotes = [goodNote, badNote];
  const randNote =
    goodAndBadNotes[Math.floor(Math.random() * goodAndBadNotes.length)];
  return randNote;
}
function generateFood() {
  let randNote = generateRandNote(cMajorNotes, otherNotes);
  let newPosition = { x: 0, y: 0 };
  do {
    newPosition = {
      x: Math.floor(Math.random() * boardWidth),
      y: Math.floor(Math.random() * boardHeight),
    };
  } while (
    snake.some(
      (segment) => segment.x === newPosition.x && segment.y === newPosition.y
    )
  );
  food = {
    x: newPosition.x,
    y: newPosition.y,
    color: cMajorNotes.includes(randNote) ? "green" : "red",
    noteName: randNote.note,
    noteFrequency: randNote.frequency,
  };
}

function endGame() {
  // Display game over message and stop game loop
  clearInterval(gameInterval);
  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

  // Stop game loop
  clearInterval(gameInterval);
}

generateFood();
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp" && direction !== "down") {
    direction = "up";
  } else if (event.key === "ArrowDown" && direction !== "up") {
    direction = "down";
  } else if (event.key === "ArrowLeft" && direction !== "right") {
    direction = "left";
  } else if (event.key === "ArrowRight" && direction !== "left") {
    direction = "right";
  }
});
