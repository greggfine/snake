import * as Tone from "tone";

import { Food, Note, Position } from "./types/types";
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// Get DOM Elements
const startGameBtn = document.getElementById(
  "start-game-btn"
) as HTMLButtonElement;
const optionsDisplay = document.getElementById(
  "options-display"
) as HTMLDivElement;
const scoreElem = document.getElementById("score") as HTMLSpanElement;
const currentScaleElem = document.getElementById("current-scale");
const slowRadio = document.getElementById("slow") as HTMLInputElement;
const fastRadio = document.getElementById("fast") as HTMLInputElement;
const modeSelectElem = document.getElementById(
  "mode-select"
) as HTMLSelectElement;
const tonicSelectElem = document.getElementById(
  "tonic-select"
) as HTMLSelectElement;
let scaleNotesDisplay = document.getElementById(
  "scale-notes"
) as HTMLSpanElement;
const enharmonicContainer = document.getElementById(
  "enharmonic-container"
) as HTMLDivElement;
const selectedScaleElem = document.getElementById(
  "selected-scale"
) as HTMLDivElement;

// Game Variables
const cellSize = 34;
const boardWidth = canvas.width / cellSize;
const boardHeight = canvas.height / cellSize;
let snake = [{ x: 5, y: 5 }];
let food: Food = { x: 10, y: 10 };
let direction = "right";
let score = 0;
let roundNumber = 1;
let level = "slow";
let attackTriggered = false;
let gameInterval: number;
let optionsIsHidden = false;
let selectedMode = "ionian";
let tonicNote = "C";
let { mainNotes, complementaryNotes } = getScaleNotes(
  //@ts-ignore
  tonics[tonicNote],
  //@ts-ignore
  scales[selectedMode]
);
let useSharps = true;

function generateScaleNotes() {
  let scaleNotes = mainNotes
    .reduce((accum, curr) => {
      return accum + " " + curr.note;
    }, "")
    .trim();
  scaleNotesDisplay.textContent = scaleNotes;
}

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

function init() {
  generateTonicNotes();
  generateScaleNotes();
  generateFood();
}

function startGame() {
  //   canvas.style.cursor = "none";
  gameInterval = setInterval(gameLoop, level === "fast" ? 160 : 200);
  if (audioCTX.state === "suspended") {
    audioCTX.resume();
  }
  synth.set({
    volume: -15,
    oscillator: {
      type: "fatsawtooth",
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
  synth.triggerAttack([
    `${mainNotes[0].note}4`,
    `${mainNotes[2].note}4`,
    `${mainNotes[4].note}4`,
  ]);
}

function generateTonicNotes() {
  const selectedOption = tonicSelectElem.selectedOptions[0];

  let selectedIndex;
  if (selectedOption) {
    selectedIndex = selectedOption.index; // Store the original index of the selected option
  }

  tonicNotes.forEach((note) => {
    const optionElem = document.createElement("option");
    optionElem.setAttribute("value", note);
    optionElem.textContent = note;
    tonicSelectElem.appendChild(optionElem);
  });

  if (selectedOption && !tonicSelectElem.contains(selectedOption)) {
    tonicSelectElem.add(selectedOption, selectedIndex);
  }
}

function checkFoodCollision() {
  // Check if snake head is in the same position as the food
  if (snake[0].x === food.x && snake[0].y === food.y) {
    const noteName = food.noteName;
    if (
      mainNotes.find((obj) => {
        return obj.note === food.noteName;
      })
    ) {
      updateScore("increment");
      Tone.loaded().then(() => {
        sampler.triggerAttackRelease(`${noteName}4`, 0.5);
      });
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

function checkCollisions(position: Position) {
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
  ctx.fillStyle = "#3c3a88";
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
  ctx.fillStyle = "#1A090D";
  ctx.arc(
    (food.x + 0.5) * cellSize,
    (food.y + 0.5) * cellSize,
    cellSize / 2,
    0,
    2 * Math.PI
  );
  ctx.font = "600 24px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const textX = (food.x + 0.5) * cellSize;
  const textY = (food.y + 0.53) * cellSize;

  ctx.fillText(food.noteName, textX, textY);
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#3c3a88";
  scoreElem.textContent = score.toString();
}

function updateScore(state: string) {
  state === "increment" ? score++ : score--;
}

function generateRandNote(goodNotes: Note[], badNotes: Note[]) {
  const goodNote = goodNotes[Math.floor(Math.random() * goodNotes.length)];
  const badNote = badNotes[Math.floor(Math.random() * badNotes.length)];
  const goodAndBadNotes = [goodNote, badNote];
  const randNote =
    goodAndBadNotes[Math.floor(Math.random() * goodAndBadNotes.length)];
  return randNote;
}
function generateFood() {
  let randNote = generateRandNote(mainNotes, complementaryNotes);

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
    color: mainNotes.includes(randNote) ? "green" : "red",
    noteName: randNote.note,
    noteFrequency: randNote.frequency,
  };
}

function endGame() {
  canvas.style.cursor = "initial";
  synth.triggerRelease([
    `${mainNotes[0].note}4`,
    `${mainNotes[2].note}4`,
    `${mainNotes[4].note}4`,
  ]);
  // Display game over message and stop game loop
  clearInterval(gameInterval);
  ctx.fillStyle = "#000";
  ctx.font = "65px Changa One";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Play Again?";
  playAgainBtn.classList.add("play-again-btn");
  canvas.insertAdjacentElement("afterend", playAgainBtn);
  playAgainBtn.addEventListener("click", (e: Event) => {
    optionsDisplay.classList.remove("hidden");
    score = 0;
    scoreElem.textContent = score.toString();
    const playAgainBtn = e.target as HTMLButtonElement;
    const canvasEl = playAgainBtn.parentElement as HTMLBodyElement;
    canvasEl.removeChild(playAgainBtn);
    /* THIS IS TEMPORARY: NEED TO RESET STATE and START GAME */
    window.location.reload();
  });

  /* reset score */
  /* remove GAME OVER */
  /* reset food */
  /* reset snake */
  /* playAgainBtn disappear */

  // Stop game loop
  clearInterval(gameInterval);
}

// generateFood();

// Event Listeners
startGameBtn.addEventListener("click", () => {
  !optionsIsHidden
    ? optionsDisplay.classList.add("hidden")
    : optionsDisplay.classList.remove("hidden");

  selectedScaleElem.textContent = `${tonicNote} ${
    selectedMode[0].toUpperCase() + selectedMode.slice(1)
  }`;
});
tonicSelectElem.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLSelectElement;
  tonicNote = target.value;

  if (tonicNote.length > 1 && useSharps) {
    tonicNote = tonicNote.slice(0, 2);
  } else if (tonicNote.length > 1 && !useSharps) {
    tonicNote = tonicNote.slice(3);
  }
  ({ mainNotes, complementaryNotes } = getScaleNotes(
    //@ts-ignore
    tonics[tonicNote],
    //@ts-ignore
    scales[selectedMode],
    useSharps
  ));

  generateScaleNotes();
  generateFood();
});

modeSelectElem.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLSelectElement;
  selectedMode = target.value.toLowerCase();
  ({ mainNotes, complementaryNotes } = getScaleNotes(
    //@ts-ignore
    tonics[tonicNote],
    //@ts-ignore
    scales[selectedMode],
    useSharps
  ));
  generateScaleNotes();
  generateFood();
});

slowRadio.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLInputElement;
  level = target.value;
});

fastRadio.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLInputElement;
  level = target.value;
});

function handleStartGame(event: KeyboardEvent) {
  if (
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight"
  ) {
    event.preventDefault();
    canvas.style.cursor = "none";
    startGame();
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === "ArrowUp" && direction !== "down") {
    direction = "up";
  } else if (event.key === "ArrowDown" && direction !== "up") {
    direction = "down";
  } else if (event.key === "ArrowLeft" && direction !== "right") {
    direction = "left";
  } else if (event.key === "ArrowRight" && direction !== "left") {
    direction = "right";
  }

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }
}

function handleGenerateFood(event: KeyboardEvent) {
  if (event.key === " " && food.color === "red") {
    event.preventDefault();
    generateFood();
  }
}

document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keydown", handleGenerateFood);
document.addEventListener("keydown", handleStartGame, { once: true });

enharmonicContainer.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLInputElement;
  const flatOrSharp = target.value;
  useSharps = flatOrSharp === "flat" ? false : true;
  if (tonicNote.length > 1) {
    //@ts-ignore
    tonicNote = tonicNoteLookup[tonicNote];
  }

  ({ mainNotes, complementaryNotes } = getScaleNotes(
    //@ts-ignore
    tonics[tonicNote],
    //@ts-ignore
    scales[selectedMode],
    useSharps
  ));
  generateScaleNotes();
});

init();
