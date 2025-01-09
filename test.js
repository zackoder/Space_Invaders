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

// Draw the enemies
function drawEnemies() {
  top = 0;
  left = 0;
  enemies = []; // Reset enemies array
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 10; j++) {
      const alien = new Image();
      const enemyType = Math.ceil(Math.random() * 3);
      alien.src = `./images/enemy${enemyType}.png`;
      alien.className = "alien";
      alien.style.position = "absolute";
      alien.style.top = `${top}px`;
      alien.style.left = `${left}px`;
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
let lastTime = 0;
let enemyDirection = 1;
const enemySpeed = 3;
const bulletSpeed = 20;
const playerSpeed = 5;

drawEnemies(); // Initial drawing of enemies

// Game loop
function gameLoop(timestamp) {
  if (isGameOver || isPaused) {
    if (isPaused) {
      layout.style.display = "flex";
      layout.innerText = 'Press "P" to continue the game';
    }
    return;
  }

  if (!lastTime) lastTime = timestamp;
  const elapsed = timestamp - lastTime;

  if (elapsed > 1000 / 60) {
    updateEnemies();
    updateBullets();
    handlePlayerMovement();
    lastTime = timestamp;
  }

  requestAnimationFrame(gameLoop);
}

// Update enemy positions
function updateEnemies() {
  enemies.forEach((enemy) => {
    let currentLeft = parseInt(enemy.style.left, 10);
    let newLeft = currentLeft + enemySpeed * enemyDirection;

    if (newLeft <= 0 || newLeft >= game.clientWidth - 44) {
      enemyDirection *= -1;
      enemies.forEach((e) => {
        let currentTop = parseInt(e.style.top, 10);
        e.style.top = `${currentTop + 5}px`;
      });
    }

    enemy.style.left = `${currentLeft + enemySpeed * enemyDirection}px`;

    // Game over check
    if (parseInt(enemy.style.top) >= game.clientHeight - 80) {
      if (!isGameOver) {
        endGame("Game Over");
      }
    }
  });
}

// Update bullets and detect collisions
function updateBullets() {
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

    // Check for win condition
    if (enemies.length === 0) {
      endGame("You Win!");
    }

    return true;
  });
}

// Handle player movement
function handlePlayerMovement() {
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
}

// Check for collision between two elements
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

// End the game
function endGame(message) {
  isGameOver = true;
  layout.style.display = "flex";
  layout.innerText = message;

  if (score > bestScore) {
    bestScore = score;
    bestScoreDisplay.innerHTML = `Best Score: ${bestScore}`;
    localStorage.setItem("bestScore", bestScore);
  }
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
  requestAnimationFrame(gameLoop);
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
      requestAnimationFrame(gameLoop);
    }
  }

  if ((e.key === "r" || e.code === "R") && isGameOver) {
    resetGame();
  }
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

requestAnimationFrame(gameLoop);

/* const game = document.querySelector("#game");

let win = false;
let top = 0;
let left = 0;
let enemys = [];
let bullets = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let isPaused = true;
let isgameover = false;

let keysPressed = {};

const scoreDisplay = document.querySelector("#score");
const bestscore = document.querySelector(".bestscore");
const actualescore = document.querySelector(".score");
bestscore.innerHTML += bestScore;
actualescore.innerHTML += score;

function draw() {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 10; j++) {
      let alien = new Image();
      let enemynum = Math.ceil(Math.random() * 3);
      alien.src = `./images/enemy${enemynum}.png`;
      alien.className = "alien";
      alien.style.position = "absolute";
      alien.style.top = `${top}px`;
      alien.style.left = `${left}px`;
      left += 44;
      game.appendChild(alien);
      enemys.push(alien);
    }
    left = 0;
    top += 30;
  }
}

draw();

const player = new Image();
player.src = "images/player.png";
player.style.position = "absolute";
player.style.bottom = "10px";
player.style.left = "154px";
player.style.zIndex = "10";
player.className = "player";
game.appendChild(player);

let lastTime = 0;
let enemyDirection = 1;
const enemySpeed = 3;
const bulletSpeed = 20;
const playerSpeed = 5;

const layout = document.querySelector(".lay_out");
let firingCooldown = false;

const gameLoop = (timestamp) => {
  if (isgameover) return;

  if (isPaused) {
    layout.style.display = "flex";
    layout.innerText = 'Pres "P" to continue the game';
    return;
  }

  if (!lastTime) lastTime = timestamp;
  const elapsed = timestamp - lastTime;

  if (elapsed > 1000 / 60) {
    const enemies = Array.from(game.querySelectorAll(".alien"));
    enemies.forEach((enemy, i) => {
      let currentLeft = parseInt(enemy.style.left, 10);
      let newLeft = currentLeft + enemySpeed * enemyDirection;
      if (i == 7 && enemyDirection < 0) {
        console.log(newLeft);
        console.log();
      }
      if (newLeft < 0 || newLeft >= game.clientWidth - 44) {
        enemyDirection *= -1;
        enemies.forEach((e) => {
          let currentTop = parseInt(e.style.top, 10);
          e.style.top = `${currentTop + 5}px`;
        });
      }

      enemy.style.left = `${currentLeft + enemySpeed * enemyDirection}px`;

      if (parseInt(enemy.style.top) >= game.clientHeight - 80) {
        if (!isgameover) {
          layout.style.display = "flex";
          layout.innerText = "Game Over";
          isgameover = true;
          bestScore = localStorage.getItem("bestScore") || 0;
          if (score > bestScore) {
            bestScore = score;
            bestscore.innerHTML = `Best Score: ${bestScore}`;
            localStorage.setItem("bestScore", bestScore);
          }
        }
      }
    });

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

    lastTime = timestamp;
  }
  requestAnimationFrame(gameLoop);
};
requestAnimationFrame(gameLoop);

let bulletTime = 0;
let lastFire = 0;
const movebullet = (bulletTime) => {
  if (!lastFire) lastFire = bulletTime;
  const elapsed = bulletTime - lastFire;
  if (elapsed > 1000 / 60) {
    bullets = bullets.filter((bullet) => {
      let bulletTop = parseInt(bullet.style.top, 10);
      bullet.style.top = `${bulletTop - bulletSpeed}px`;
      if (bulletTop <= 0) {
        bullet.remove();
        return false;
      }

      if (enemies.length === 0) {
        layout.style.display = "flex";
        layout.innerText = "You Win";
        win = true;
        return;
      }

      enemies.forEach((enemy) => {
        const enemyRect = enemy.getBoundingClientRect();
        const bulletRect = bullet.getBoundingClientRect();

        if (
          bulletRect.top < enemyRect.bottom &&
          bulletRect.bottom > enemyRect.top &&
          bulletRect.left < enemyRect.right &&
          bulletRect.right > enemyRect.left
        ) {
          enemy.remove();
          bullet.remove();
          score += 10;
          if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);
          }
          actualescore.innerHTML = `Score: ${score}`;
        }
      });
      return true;
    });
  }
};

document.addEventListener("keydown", (e) => {
  if (!win && !isgameover) {
    return;
  }
  if (e.key === " " || e.code === "Space") {
    win = false;
    isgameover = false;
    top = 0;
    left = 0;
    enemys = [];
    bullets = [];
    score = 0;
    bestScore = localStorage.getItem("bestScore") || 0;
    isPaused = false;
    isgameover = false;
    keysPressed = {};
    layout.style.display = "none";
    Array.from(game.querySelectorAll(".bullet")).forEach((bullet) => {
      bullet.remove();
    });
    Array.from(game.querySelectorAll(".alien")).forEach((alien) => {
      alien.remove();
    });
    draw();
    requestAnimationFrame(gameLoop);
  }
});

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  console.log(keysPressed);

  if ((e.key === " " || e.code === "Space") && !firingCooldown) {
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

    setTimeout(() => {
      firingCooldown = false;
    }, 200);
  }
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
  if (e.key === "p" || e.key === "P") {
    isPaused = !isPaused;
    if (!isPaused) {
      layout.innerHTML = "";
      layout.style.display = "none";
      requestAnimationFrame(gameLoop);
    }
  }
});
 */
