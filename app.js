// Set up canvas and game board
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Get DOM Elements
const scoreElem = document.getElementById("score");
const currentScaleElem = document.getElementById("current-scale");
const slowRadio = document.getElementById("slow");
const fastRadio = document.getElementById("fast");
const modeSelectElem = document.getElementById("mode-select");

// Game Variables
const cellSize = 27;
const boardWidth = canvas.width / cellSize;
const boardHeight = canvas.height / cellSize;
let snake = [{ x: 5, y: 5 }];
let food = { x: 10, y: 10 };
let direction = "right";
let score = 0;
let roundNumber = 1;
let level = "slow";
let userSelectedMode = cMajorNotes;
let otherNotes = notCMajorNotes;
let attackTriggered = false;
let gameInterval;

// Audio Variables
const audioCTX = new AudioContext();
const correctAnswerSound = new Audio("audio/correctAnswer.wav");
const wrongAnswerSound = new Audio("audio/wrongAnswer.wav");
const synth = new Tone.PolySynth(Tone.Synth);
const now = Tone.now();
const sampler = new Tone.Sampler({
  urls: {
    C5: "C5.wav",
  },
  baseUrl: "audio/vibraphone/",
  release: 1,
}).toDestination();

/* ============================================== */

function startGame() {
  gameInterval = setInterval(gameLoop, level === "fast" ? 160 : 200);
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  synth.set({
    volume: -15,
    oscillator: {
      type: "sawtooth",
      count: 3,
      spread: 40,
    },
    envelope: {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.4,
      release: 1,
    },
  });

  const gain = new Tone.Gain();

  const filter = new Tone.Filter({
    type: "lowpass",
    frequency: 1200,
    rolloff: -12,
    Q: 4,
  });

  //   lfo.connect(filter.frequency);

  const envelope = new Tone.AmplitudeEnvelope({
    attack: 3, // set a slow attack time
    decay: 1,
    sustain: 0.5,
    release: 3,
  });

  synth.connect(filter).connect(envelope).toDestination();
  synth.triggerAttack(["C4", "E4", "G4"]);
}

function checkFoodCollision() {
  // Check if snake head is in the same position as the food
  if (snake[0].x === food.x && snake[0].y === food.y) {
    const noteName = food.noteName;
    Tone.loaded().then(() => {
      sampler.triggerAttackRelease(`${noteName}4`, 0.5);
    });
    if (
      userSelectedMode.find((obj) => {
        return obj.note === food.noteName;
      })
    ) {
      updateScore("increment");
    } else {
      const noiseSynth = new Tone.NoiseSynth().toDestination();
      noiseSynth.triggerAttackRelease("4n");
      if (score > 0) {
        updateScore("decrement");
      }
    }
    // Increase the score, generate new food, and add a new segment to the snake
    generateFood();
    snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y });
  }
}

function gameLoop() {
  // Update snake position and check for collisions
  const newPosition = calculateNewPosition();
  if (checkCollisions(newPosition)) {
    wrongAnswerSound.play();
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
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const textX = (food.x + 0.5) * cellSize;
  const textY = (food.y + 0.5) * cellSize;
  ctx.fillText(food.noteName, textX, textY);
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  scoreElem.textContent = score;
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
  let randNote = generateRandNote(userSelectedMode, otherNotes);
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
    color: userSelectedMode.includes(randNote) ? "green" : "red",
    noteName: randNote.note,
    noteFrequency: randNote.frequency,
  };
}

function endGame() {
  synth.triggerRelease(["C4", "E4", "G4"]);

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

// Event Listeners
modeSelectElem.addEventListener("change", (e) => {
  let selectedModeString = e.target.value;
  if (selectedModeString === "cMajorNotes") {
    userSelectedMode = cMajorNotes;
    otherNotes = notCMajorNotes;
  }
  if (selectedModeString === "cDorianNotes") {
    userSelectedMode = cDorianNotes;
    otherNotes = notCDorianNotes;
  }
  console.log(userSelectedMode);
});

slowRadio.addEventListener("change", (e) => {
  level = e.target.value;
});

fastRadio.addEventListener("change", (e) => {
  level = e.target.value;
});

document.addEventListener(
  "keydown",
  function (event) {
    if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      startGame();
    }
  },
  { once: true }
);

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

document.addEventListener("keydown", function (event) {
  if (event.key === " " && food.color === "red") {
    generateFood();
  }
});
