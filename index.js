/* const game = document.querySelector("#game");
const player = document.querySelector(".player");

let win = false;
let top = 0;
let left = 0;
let enemies = [];
let bullets = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let isPaused = true;
let isGameOver = false;
let enemesPositions = [];

let playerPosition = 255;
let keysPressed = {};

const scoreDisplay = document.querySelector("#score");
const bestScoreDisplay = document.querySelector(".bestscore");
const currentScoreDisplay = document.querySelector(".score");
bestScoreDisplay.innerHTML = `Best Score: ${bestScore}`;
currentScoreDisplay.innerHTML = `Score: ${score}`;

const layout = document.querySelector(".lay_out");
let firingCooldown = false;

let enemiesAnimationId = null;
let bulletsAnimationId = null;
let playerAnimationId = null;

function drawEnemies() {
  top = 0;
  left = 0;
  enemies = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 7; j++) {
      const alien = new Image();
      const enemyType = Math.ceil(Math.random() * 3);
      alien.src = `./images/enemy${enemyType}.png`;
      alien.className = "alien";
      alien.style.position = "absolute";
      alien.style.transform = `translate(${left}px, ${top}px)`;
      let enemyPosition = { Left: left, Top: top };
      enemesPositions.push(enemyPosition);
      left += 44;
      game.appendChild(alien);
      enemies.push(alien);
    }
    left = 0;
    top += 30;
  }
}

let enemyDirection = 1;
const enemySpeed = 1;
const bulletSpeed = 10;
const playerSpeed = 3;

drawEnemies();

function updateEnemies() {
  if (isGameOver || isPaused) return;

  enemies.forEach((enemy, i) => {
    let currentLeft = enemesPositions[i].Left;
    let currentTop = enemesPositions[i].Top;

    let newLeft = currentLeft + enemySpeed * enemyDirection;

    if (newLeft <= 0 || newLeft >= 550) {
      enemyDirection *= -1;
      enemies.forEach((e, index) => {
        let eTop = enemesPositions[index].Top;
        e.style.transform = `translate(${enemesPositions[index].Left}px, ${
          eTop + 5
        }px)`;
        enemesPositions[index].Top += 5;
      });
    }

    enemesPositions[i].Left = newLeft;
    enemy.style.transform = `translate(${newLeft}px, ${currentTop}px)`;

    if (currentTop >= 550) {
      if (!isGameOver) {
        endGame("Game Over");
      }
    }
  });

  // Continue animation
  enemiesAnimationId = requestAnimationFrame(updateEnemies);
}


function updateBullets() {
  if (isGameOver || isPaused) return;

  // Iterate backward to prevent index shifting issues during removal
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    let bulletTop = bulletPosition[i].Top;
    let bulletLeft = bulletPosition[i].Left;

    // Move the bullet
    bulletTop -= bulletSpeed;
    bullet.style.transform = `translate(${bulletLeft}px, ${bulletTop}px)`;
    bulletPosition[i].Top = bulletTop;

    // Remove bullet if it moves out of bounds
    if (bulletTop <= 0) {
      bullet.remove();
      bullets.splice(i, 1);
      bulletPosition.splice(i, 1);
      continue; // Skip further processing for this bullet
    }

    // Check for collision with enemies
    let collided = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      if (checkCollision(bullet, enemy)) {
        // Remove the bullet and the enemy
        bullet.remove();
        enemy.remove();
        bullets.splice(i, 1);
        bulletPosition.splice(i, 1);
        enemies.splice(j, 1);

        // Update the score
        score += 10;
        currentScoreDisplay.innerHTML = `Score: ${score}`;
        collided = true;
        break; // Stop checking this bullet for further collisions
      }
    }

    // If enemies are all defeated, end the game
    if (enemies.length === 0) {
      endGame("You Win!");
      return; // Stop further updates if the game is won
    }

    // If the bullet collided, skip further processing for this bullet
    if (collided) continue;
  }

  // Continue animation
  bulletsAnimationId = requestAnimationFrame(updateBullets);
}


function handlePlayerMovement() {
  if (isGameOver || isPaused) return;

  if (keysPressed["ArrowLeft"] && playerPosition > 0) {
    player.style.transform = `translate(${
      playerPosition - playerSpeed
    }px, 550px)`;
    playerPosition -= playerSpeed;
  }
  if (keysPressed["ArrowRight"] && playerPosition < 550) {
    player.style.transform = `translate(${
      playerPosition + playerSpeed
    }px, 550px)`;
    playerPosition += playerSpeed;
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

let bulletPosition = [];

function fireBullet() {
  if (!firingCooldown) {
    const playerLeft = playerPosition + 23;
    const bullet = document.createElement("div");
    bullet.style.transform = `translate(${playerLeft}px, 550px)`;
    let bulletP = { Left: playerLeft, Top: 550 };

    bullet.className = "bullet";
    game.appendChild(bullet);
    bulletPosition.push(bulletP);
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
  playerPosition = 255;
  enemesPositions = []
  bulletPosition = []
  currentScoreDisplay.innerHTML = `Score: ${score}`;
  enemies.forEach((enemy) => enemy.remove());
  bullets.forEach((bullet) => bullet.remove());
  bulletPosition = [];
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
 */