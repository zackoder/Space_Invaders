const game = document.querySelector("#game");

let win = false;
let top = 0;
let left = 0;
let enemies = [];
let bullets = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let isPaused = true;
let isGameOver = false;

let keysPressed = {};

const scoreDisplay = document.querySelector("#score");
const bestScoreDisplay = document.querySelector(".bestscore");
const currentScoreDisplay = document.querySelector(".score");
bestScoreDisplay.innerHTML = `Best Score: ${bestScore}`;
currentScoreDisplay.innerHTML = `Score: ${score}`;

const layout = document.querySelector(".lay_out");
let firingCooldown = false;

// Track animation frame IDs
let enemiesAnimationId = null;
let bulletsAnimationId = null;
let playerAnimationId = null;

// Draw the enemies
function drawEnemies() {
  top = 0;
  left = 0;
  enemies = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 7; j++) {
      const alien = new Image();
      const enemyType = Math.ceil(Math.random() * 3);
      alien.src = `./images/enemy${enemyType}.png`;
      alien.className = "alien";
      alien.style.position = "absolute";
      
      left += 44;
      game.appendChild(alien);
      enemies.push(alien);
    }
    left = 0;
    top += 30;
  }
}

// Initialize player
const player = new Image();
player.src = "images/player.png";
player.style.position = "absolute";
player.style.bottom = "10px";
player.style.left = "154px";
player.style.zIndex = "10";
player.className = "player";
game.appendChild(player);

// Game variables
let enemyDirection = 1;
const enemySpeed = 3;
const bulletSpeed = 20;
const playerSpeed = 5;

drawEnemies();

function updateEnemies() {
  if (isGameOver || isPaused) return;

  enemies.forEach((enemy) => {
    let currentLeft = parseInt(enemy.style.left, 10);
    let newLeft = currentLeft + enemySpeed * enemyDirection;

    if (newLeft <= 0 || newLeft >= game.clientWidth - 46) {
      enemyDirection *= -1;
      enemies.forEach((e) => {
        let currentTop = parseInt(e.style.top, 10);
        e.style.top = `${currentTop + 5}px`;
      });
    }

    enemy.style.left = `${currentLeft + enemySpeed * enemyDirection}px`;

    if (parseInt(enemy.style.top, 10) >=  550) {
      if (!isGameOver) {
        endGame("Game Over");
      }
    }
  });

  enemiesAnimationId = requestAnimationFrame(updateEnemies);
}

function updateBullets() {
  if (isGameOver || isPaused) return;

  bullets = bullets.filter((bullet) => {
    let bulletTop = parseInt(bullet.style.top, 10);
    bullet.style.top = `${bulletTop - bulletSpeed}px`;

    if (bulletTop <= 0) {
      bullet.remove();
      return false;
    }

    enemies.forEach((enemy, index) => {
      if (checkCollision(bullet, enemy)) {
        bullet.remove();
        enemy.remove();
        enemies.splice(index, 1);
        score += 10;
        currentScoreDisplay.innerHTML = `Score: ${score}`;
      }
    });

    if (enemies.length === 0) {
      endGame("You Win!");
    }

    return true;
  });

  bulletsAnimationId = requestAnimationFrame(updateBullets);
}

function handlePlayerMovement() {
  if (isGameOver || isPaused) return;

  const playerLeft = parseInt(player.style.left, 10);
  if (keysPressed["ArrowLeft"] && playerLeft > 0) {
    player.style.left = `${playerLeft - playerSpeed}px`;
  }
  if (
    keysPressed["ArrowRight"] &&
    playerLeft < game.clientWidth - player.width
  ) {
    player.style.left = `${playerLeft + playerSpeed}px`;
  }

  playerAnimationId = requestAnimationFrame(handlePlayerMovement);
}

function checkCollision(obj1, obj2) {
  const rect1 = obj1.getBoundingClientRect();
  const rect2 = obj2.getBoundingClientRect();

  return !(
    rect1.top > rect2.bottom ||
    rect1.bottom < rect2.top ||
    rect1.left > rect2.right ||
    rect1.right < rect2.left
  );
}

function endGame(message) {
  isGameOver = true;
  layout.style.display = "flex";
  layout.innerText = message;

  if (score > bestScore) {
    bestScore = score;
    bestScoreDisplay.innerHTML = `Best Score: ${bestScore}`;
    localStorage.setItem("bestScore", bestScore);
  }

  cancelAnimations();
}

function fireBullet() {
  if (!firingCooldown) {
    const playerLeft = parseInt(player.style.left, 10);
    const bullet = document.createElement("div");
    bullet.style.position = "absolute";
    bullet.style.width = "5px";
    bullet.style.height = "10px";
    bullet.style.background = "red";
    bullet.style.left = `${playerLeft + player.width / 2 - 2.5}px`;
    bullet.style.top = `550px`;
    bullet.className = "bullet";
    game.appendChild(bullet);
    bullets.push(bullet);

    firingCooldown = true;
    setTimeout(() => (firingCooldown = false), 200);
  }
}

function resetGame() {
  win = false;
  isGameOver = false;
  isPaused = false;
  score = 0;
  currentScoreDisplay.innerHTML = `Score: ${score}`;
  enemies.forEach((enemy) => enemy.remove());
  bullets.forEach((bullet) => bullet.remove());
  drawEnemies();
  layout.style.display = "none";

  cancelAnimations();

  enemiesAnimationId = requestAnimationFrame(updateEnemies);
  bulletsAnimationId = requestAnimationFrame(updateBullets);
  playerAnimationId = requestAnimationFrame(handlePlayerMovement);
}

function cancelAnimations() {
  if (enemiesAnimationId !== null) cancelAnimationFrame(enemiesAnimationId);
  if (bulletsAnimationId !== null) cancelAnimationFrame(bulletsAnimationId);
  if (playerAnimationId !== null) cancelAnimationFrame(playerAnimationId);

  enemiesAnimationId = null;
  bulletsAnimationId = null;
  playerAnimationId = null;
}

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;

  if (e.key === " " || e.code === "Space") {
    fireBullet();
  }

  if (e.key.toLowerCase() === "p") {
    isPaused = !isPaused;
    if (!isPaused) {
      layout.style.display = "none";

      cancelAnimations();

      enemiesAnimationId = requestAnimationFrame(updateEnemies);
      bulletsAnimationId = requestAnimationFrame(updateBullets);
      playerAnimationId = requestAnimationFrame(handlePlayerMovement);
    }
  }

  if ((e.key === "r" || e.code === "R") && isGameOver) {
    resetGame();
  }
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

// Start the initial animations
enemiesAnimationId = requestAnimationFrame(updateEnemies);
bulletsAnimationId = requestAnimationFrame(updateBullets);
playerAnimationId = requestAnimationFrame(handlePlayerMovement);
