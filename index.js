const game = document.getElementById("game");
const player = document.querySelector(".player");
const lay_out_Pausse = document.querySelector(".lay_out_Pausse");
const lay_out_GameOver = document.querySelector(".lay_out_GameOver");
const lay_out_YouWin = document.querySelector(".lay_out_YouWin");
const livesspan = document.querySelector(".livesspan");
const levelspan = document.querySelector(".levelspan");
const scoreDisplay = document.querySelector("#score");
const bestScoreDisplay = document.querySelector(".bestscore");
const currentScoreDisplay = document.querySelector(".score");
const alienscontainer = document.querySelector(".alienscontainer");

let lives = 3;
let level = 0;
let topp = 0;
let left = 0;
let score = 0;
let playerPosition = 255;
let enemyDirection = 1;
let alienscontainerheigth = 0;
const enemySpeed = 2;
const bulletSpeed = 5;
const playerSpeed = 3;
let gamewidth = game.clientWidth;
let bestScore = localStorage.getItem("bestScore") || 0;
let win = false;
let isPaused = true;
let isGameOver = false;
let enemies = [];
let bullets = [];
let enemesPositions = [];
let keysPressed = {};
let aliensContainerPosition = { Left: 0, Top: 35 };

bestScoreDisplay.innerHTML = `Best Score: ${bestScore}`;
currentScoreDisplay.innerHTML = `Score: ${score}`;

const layout = document.querySelector(".lay_out");
let firingCooldown = false;

let enemiesAnimationId = null;
let bulletsAnimationId = null;
let playerAnimationId = null;
let counterid = null;

livesspan.innerHTML = lives;
levelspan.innerHTML = level;

function drawEnemies() {
  aliensContainerPosition = { Left: 0, Top: 35 };

  for (let i = 0; i < 3 + level; i++) {
    for (let j = 0; j < 7; j++) {
      const alien = new Image();
      const enemyType = Math.ceil(Math.random() * 3);
      alien.src = `./images/enemy${enemyType}.png`;
      alien.className = "alien";
      alien.style.position = "absolute";
      alien.style.transform = `translate(${left}px, ${topp}px)`;
      let enemyPosition = { Left: left, Top: topp };
      enemesPositions.push(enemyPosition);
      left += 55;
      alienscontainer.appendChild(alien);
      enemies.push(alien);
    }
    left = 0;
    topp += 35;
  }
  alienscontainer.style.transform = "translate(0px, 35px);";
}

drawEnemies();

let isMovingDown = false;

function updateEnemies() {
  if (isGameOver || isPaused || isMovingDown) return;
  let currentLeft = aliensContainerPosition.Left;
  let currentTop = aliensContainerPosition.Top;
  let newLeft = currentLeft + enemySpeed * enemyDirection;

  aliensContainerPosition.Left = newLeft;
  alienscontainer.style.transform = `translate(${newLeft}px, ${currentTop}px)`;

  if (newLeft <= 0 || newLeft + alienscontainer.clientWidth >= gamewidth) {
    isMovingDown = true;
    moveEnemiesDownSmoothly(20, () => {
      isMovingDown = false;
    });
    enemyDirection *= -1;
    return;
  }
  enemiesAnimationId = requestAnimationFrame(updateEnemies);
}

function moveEnemiesDownSmoothly(steps, callback) {
  let step = 0;
  function moveStep() {
    if (step >= steps) {
      if (callback) callback();
      enemiesAnimationId = requestAnimationFrame(updateEnemies);
      return;
    }

    aliensContainerPosition.Top += 1;
    alienscontainer.style.transform = `translate(${aliensContainerPosition.Left}px, ${aliensContainerPosition.Top}px)`;

    step++;
    requestAnimationFrame(moveStep);
  }
  moveStep();
  enemies.forEach((enemy) => {
    let enemyrct = enemy.getBoundingClientRect();
    if (enemyrct.y >= 735) {
      if (!isGameOver) {
        Gameover(lay_out_GameOver);
      }
    }
  });
}

let timer = 0;
let timerspan = document.querySelector(".timer");
timerspan.innerHTML = timer;

function updateBullets() {
  if (isGameOver || isPaused) return;

  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    let bulletTop = bulletPosition[i].Top;
    let bulletLeft = bulletPosition[i].Left;
    bulletTop -= bulletSpeed;
    bullet.style.transform = `translate(${bulletLeft}px, ${bulletTop}px)`;
    bulletPosition[i].Top = bulletTop;
    if (bulletTop <= 0) {
      bullet.remove();
      bullets.splice(i, 1);
      bulletPosition.splice(i, 1);
      continue;
    }

    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      if (checkCollision(bullet, enemy)) {
        bullet.remove();
        enemy.remove();
        bullets.splice(i, 1);
        enemesPositions.splice(j, 1);
        bulletPosition.splice(i, 1);
        enemies.splice(j, 1);
        score += 10;
        currentScoreDisplay.innerHTML = `Score: ${score}`;
        break;
      }
    }
    if (enemies.length === 0) {
      nextlevel(lay_out_YouWin);
    }
  }
  bulletsAnimationId = requestAnimationFrame(updateBullets);
}

let pausedTime = 0;
let totalElapsedTime = 0;
let lastResumeTime = 0;

function counter() {
  if (isGameOver || win) return;

  if (!isPaused) {
    if (lastResumeTime === 0) {
      lastResumeTime = performance.now();
    }
    const currentTime = performance.now();
    totalElapsedTime += currentTime - lastResumeTime;
    lastResumeTime = currentTime;
    timerspan.innerHTML = Math.ceil(totalElapsedTime / 1000);
    counterid = requestAnimationFrame(counter);
  } else {
    lastResumeTime = performance.now();
  }
}

function Gameover(element) {
  lives--;
  livesspan.innerHTML = lives;
  if (lives > 0) {
    resetGame();
  } else {
    isGameOver = true;
    cancelAnimations();
    element.style.display = "flex";
    checkScore();
    lives = 3;
    resetGame();
  }
}

function nextlevel(LayOut) {
  level++;
  resetGame();
  levelspan.innerHTML = level;
  checkScore();
  if (level === 5) {
    win = true;
    cancelAnimations();
    checkScore();
    LayOut.style.display = "flex";
    score = 0;
    level = 0;
    levelspan.innerHTML = level;
  }
}

function checkScore() {
  if (score > bestScore) {
    bestScore = score;
    bestScoreDisplay.innerHTML = `Best Score: ${bestScore}`;
    localStorage.setItem("bestScore", bestScore);
  }
}

function checkCollision(obj1, obj2) {
  const bullet = obj1.getBoundingClientRect();
  const alien = obj2.getBoundingClientRect();
  return !(
    bullet.top > alien.bottom ||
    bullet.bottom < alien.top ||
    bullet.left > alien.right ||
    bullet.right < alien.left
  );
}

let bulletPosition = [];

function fireBullet() {
  if (isPaused) return;
  if (keysPressed[" "]) {
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
      setTimeout(() => (firingCooldown = false), 300);
    }
  }
}

function resetGame() {
  topp = 0;
  left = 0;
  win = false;
  isGameOver = false;
  isPaused = true;
  enemesPositions = [];
  bulletPosition = [];
  enemyDirection = 1;
  totalElapsedTime = 0;
  lastResumeTime = 0;
  timerspan.innerHTML = 0;
  score = 0;
  currentScoreDisplay.innerHTML = `Score: ${score}`;
  livesspan.innerHTML = lives;

  enemies.forEach((enemy) => enemy.remove());
  bullets.forEach((bullet) => bullet.remove());
  bullets = [];
  enemies = [];

  cancelAnimations();

  drawEnemies();
  alienscontainer.style.transform = `translate(0px, 35px)`;
  lay_out_GameOver.style.display = "none";
  lay_out_YouWin.style.display = "none";
  lay_out_Pausse.style.display = "none";
}

function cancelAnimations() {
  if (enemiesAnimationId !== null) cancelAnimationFrame(enemiesAnimationId);
  if (bulletsAnimationId !== null) cancelAnimationFrame(bulletsAnimationId);
  if (playerAnimationId !== null) cancelAnimationFrame(playerAnimationId);
  if (counterid !== null) cancelAnimationFrame(counterid);

  enemiesAnimationId = null;
  bulletsAnimationId = null;
  playerAnimationId = null;
  counterid = null;
}

function startgame() {
  if (bestScore < score) {
    bestScore = score;
    bestScoreDisplay.innerHTML = `Best Score: ${bestScore}`;
    localStorage.setItem("bestScore", bestScore);
  }
  isPaused = !isPaused;
  lay_out_Pausse.style.display = "none";

  cancelAnimations();

  enemiesAnimationId = requestAnimationFrame(updateEnemies);
  bulletsAnimationId = requestAnimationFrame(updateBullets);
  playerAnimationId = requestAnimationFrame(handlePlayerMovement);
}

function handlePlayerMovement() {
  if (isGameOver || isPaused) return;

  if (keysPressed["ArrowLeft"] && playerPosition > 0) {
    playerPosition -= playerSpeed;
    player.style.transform = `translate(${playerPosition}px, 550px)`;
  }

  if (keysPressed["ArrowRight"] && playerPosition < gamewidth - 50) {
    playerPosition += playerSpeed;
    player.style.transform = `translate(${playerPosition}px, 550px)`;
  }

  if (keysPressed[" "]) {
    fireBullet();
  }

  playerAnimationId = requestAnimationFrame(handlePlayerMovement);
}

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  if (e.key.toLowerCase() === "p" && !isGameOver && !win) {
    isPaused = !isPaused;
    if (!isPaused) {
      lay_out_Pausse.style.display = "none";
      cancelAnimations();
      enemiesAnimationId = requestAnimationFrame(updateEnemies);
      bulletsAnimationId = requestAnimationFrame(updateBullets);
      playerAnimationId = requestAnimationFrame(handlePlayerMovement);
    } else {
      lay_out_Pausse.style.display = "flex";
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (keysPressed[e.key]) {
    keysPressed[e.key] = false;
  }
});

enemiesAnimationId = requestAnimationFrame(updateEnemies);
bulletsAnimationId = requestAnimationFrame(updateBullets);
playerAnimationId = requestAnimationFrame(handlePlayerMovement);
requestAnimationFrame(counter);
