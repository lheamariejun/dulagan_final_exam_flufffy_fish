const canvas = document.getElementById('gameCanvas');
canvas.width = 400;
canvas.height = 600;
const ctx = canvas.getContext('2d');

const fishImg = new Image();
fishImg.src = './images/pish1.png';

const pipeNorth = new Image();
pipeNorth.src = './images/pipe-north.png';

const pipeSouth = new Image();
pipeSouth.src = './images/pipe-south.png';

const bgImg = new Image();
bgImg.src = './images/pish-background.jpg';

const flapSound = new Audio('./sounds/fish_swim.mp3');
const scoreSound = new Audio('./sounds/score.mp3');
const gameOverSound = new Audio('./sounds/game_over.mp3');
const bgMusic = new Audio('./sounds/underwater_bubbles.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

const gap = 140;
let fish, pipes, score, gameOver;

const startOverlay = document.getElementById('startOverlay');
const playButton = document.getElementById('playButton');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const restartButton = document.getElementById('restartButton');
const finalScoreText = document.getElementById('finalScoreText');

// Disable play button until all assets are loaded
playButton.disabled = true;
playButton.textContent = "Loading...";

// Track image loading
let imagesLoaded = 0;
const totalImages = 4;

function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    console.log('All images loaded. Ready to start.');
    playButton.disabled = false;
    playButton.textContent = "Play";
    startOverlay.classList.remove('hidden'); // Show the overlay
  }
}

bgImg.onload = imageLoaded;
fishImg.onload = imageLoaded;
pipeNorth.onload = imageLoaded;
pipeSouth.onload = imageLoaded;

function initGameState() {
  fish = {
    x: 50,
    y: 150,
    width: 70,
    height: 50,
    gravity: 0.25,
    lift: -7,
    velocity: 0,
    angle: 0,
    maxY: canvas.height
  };
  pipes = [{ x: canvas.width, y: 0 }];
  score = 0;
  gameOver = false;
}

function startGame() {
  startOverlay.classList.add('hidden');
  initGameState();
  bgMusic.play();
  draw();
}

function endGame() {
  gameOver = true;
  bgMusic.pause();
  gameOverSound.play();

  finalScoreText.textContent = `Your Score: ${score}`;
  
  // Show the game over overlay
  gameOverOverlay.classList.remove('hidden');
  startOverlay.classList.add('hidden');
}

function updateFish() {
  fish.velocity += fish.gravity;
  fish.y += fish.velocity;

  if (fish.y <= 0 || fish.y + fish.height >= canvas.height) {
    endGame();
    return;
  }

  fish.y = Math.max(0, Math.min(fish.y, fish.maxY - fish.height));
  const maxDownAngle = 90;
  const maxUpAngle = -30;
  fish.angle = Math.min(maxDownAngle, Math.max(maxUpAngle, fish.velocity * 5));
}

function fishJump() {
  if (!gameOver) {
    fish.velocity = fish.lift;
    flapSound.play();
  }
}

function drawFish(ctx) {
  const centerX = fish.x + fish.width / 2;
  const centerY = fish.y + fish.height / 2;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((fish.angle || 0) * Math.PI / 180);
  ctx.drawImage(fishImg, -fish.width / 2, -fish.height / 2, fish.width, fish.height);
  ctx.restore();
}

function draw() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  for (let i = 0; i < pipes.length; i++) {
    const pipeWidth = 60;
    const pipeHeight = 300;
    const constant = pipeHeight + gap;

    ctx.drawImage(pipeNorth, pipes[i].x, pipes[i].y, pipeWidth, pipeHeight);
    ctx.drawImage(pipeSouth, pipes[i].x, pipes[i].y + constant, pipeWidth, pipeHeight);

    pipes[i].x--;

    if (pipes[i].x === 150) {
      pipes.push({ x: canvas.width, y: Math.floor(Math.random() * pipeHeight) - pipeHeight });
    }

    if (
      fish.x + fish.width >= pipes[i].x &&
      fish.x <= pipes[i].x + pipeWidth &&
      (fish.y <= pipes[i].y + pipeHeight || fish.y + fish.height >= pipes[i].y + constant)
    ) {
      endGame();
      return;
    }

    if (pipes[i].x === fish.x) {
      score++;
      scoreSound.play();
    }
  }

  updateFish();
  drawFish(ctx);

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 25);

  // If game is still ongoing, request next frame
  if (!gameOver) {
    requestAnimationFrame(draw);
  }
}

canvas.addEventListener('click', fishJump);
playButton.addEventListener('click', startGame);

restartButton.addEventListener('click', () => {
  gameOverOverlay.classList.add('hidden');
  startOverlay.classList.remove('hidden');
});
