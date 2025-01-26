const game = document.getElementById("game");
const player = document.querySelector(".player");
const lay_out_Pausse = document.querySelector(".lay_out_Pausse");
const lay_out_GameOver = document.querySelector(".lay_out_GameOver");
const lay_out_YouWin = document.querySelector(".lay_out_YouWin");
const livesspan = document.querySelector(".livesspan");
const levelspan = document.querySelector(".levelspan");
const bestScoreDisplay = document.querySelector(".bestscore");
const currentScoreDisplay = document.querySelector(".score");
const alienscontainer = document.querySelector(".alienscontainer");
const restbtn = Array.from(document.querySelectorAll(".resetGame"));

let lives = 3;
let level = 0;
let topp = 0;
let left = 0;
let score = 0;
let playerPosition = 255;
let enemyDirection = 1;
const enemySpeed = 3;
const bulletSpeed = 5;
const playerSpeed = 3;
let gamewidth = game.clientWidth;
let bestScore = localStorage.getItem("bestScore") || 0;
let win = false;
let isPaused = true;
let isGameOver = false;
let firingCooldown = false;
let isMovingDown = false;
let enemies = [];
let bullets = [];
let enemesPositions = [];
let keysPressed = {};
let aliensContainerPosition = { Left: 0, Top: 35 };

bestScoreDisplay.innerHTML = `Best Score: ${bestScore}`;
function Score() {
  currentScoreDisplay.innerHTML = `Score: ${score}`;
  requestAnimationFrame(Score);
}
requestAnimationFrame(Score);

const layout = document.querySelector(".lay_out");

let enemiesAnimationId = null;
let bulletsAnimationId = null;
let playerAnimationId = null;
let startIncrementId = null;

livesspan.innerHTML = lives;
levelspan.innerHTML = level;

restbtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    level = 0;
    lives = 3;
    count = 0;
    second = 0;
    minute = 0;
    livesspan.textContent = lives;
    levelspan.textContent = level;
    resetGame();
  });
});

function drawEnemies() {
  for (let i = 0; i < 3 + level; i++) {
    for (let j = 0; j < 7; j++) {
      const alien = new Image();
      const enemyType = Math.ceil(Math.random() * 3);
      alien.src = `./images/enemy${enemyType}.png`;
      alien.className = "alien";
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
}

drawEnemies();

function updateEnemies() {
  if (isGameOver || isPaused || isMovingDown) return;

  let currentLeft = aliensContainerPosition.Left;
  let currentTop = aliensContainerPosition.Top;
  let newLeft = currentLeft + enemySpeed * enemyDirection;

  aliensContainerPosition.Left = newLeft;
  alienscontainer.style.transform = `translate(${newLeft}px, ${currentTop}px)`;

  if (newLeft <= 0 || newLeft + 375 >= gamewidth) {
    isMovingDown = true;
    moveEnemiesDownSmoothly(20, () => {
      isMovingDown = false;
    });
    enemyDirection *= -1;
    return;
  }
  enemies.forEach((_, i) => {
    if (enemesPositions[i].Top >= 490) {
      if (!isGameOver) {
        Gameover(lay_out_GameOver);
      }
    }
  });
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

    enemies.forEach((enemy, i) => {
      enemesPositions[i].Top += 1;
      enemy.style.transform = `translate(${enemesPositions[i].Left}px, ${enemesPositions[i].Top}px)`;
    });

    step++;
    requestAnimationFrame(moveStep);
  }
  moveStep();
}

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
        //currentScoreDisplay.innerHTML = `Score: ${score}`;
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

function nextlevel(LayOut) {
  level++;
  resetGame();
  levelspan.innerHTML = level;
  checkScore();
  if (level === 5) {
    win = true;
    cancelAnimations();
    stopIncrement();
    cancelAnimationFrame(startIncrementId);
    startIncrementId = null;
    checkScore();
    LayOut.style.display = "flex";
    score = 0;
    level = 0;
    lives = 3;
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

function handlePlayerMovement() {
  if (isGameOver || isPaused) return;
  if (keysPressed["ArrowLeft"] && playerPosition > 0) {
    playerPosition -= playerSpeed;
    player.style.transform = `translate(${playerPosition}px, 550px)`;
  }
  if (keysPressed["ArrowRight"] && playerPosition < 550) {
    playerPosition += playerSpeed;
    player.style.transform = `translate(${playerPosition}px, 550px)`;
  }
  if (keysPressed[" "]) fireBullet();
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

function Gameover(element) {
  lives--;
  resetGame();
  livesspan.innerHTML = lives;
  if (lives === 0) {
    isGameOver = true;
    stopIncrement();
    cancelAnimationFrame(startIncrementId);
    startIncrementId = null;
    score = 0;
    cancelAnimations();
    element.style.display = "flex";
    checkScore();
    lives = 3;
    level = 0;
  }
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
  isPaused = false;
  enemesPositions = [];
  bulletPosition = [];
  enemyDirection = 1;
  currentScoreDisplay.innerHTML = `Score: ${score}`;
  enemies.forEach((enemy) => enemy.remove());
  bullets.forEach((bullet) => bullet.remove());
  bullets = [];
  enemies = [];
  bulletPosition = [];
  drawEnemies();
  aliensContainerPosition = { Left: 0, Top: 35 };
  alienscontainer.style.transform = `translate(0px, 35px)`;
  lay_out_GameOver.style.display = "none";
  lay_out_YouWin.style.display = "none";
  lay_out_Pausse.style.display = "none";

  cancelAnimations();

  requestAnimations();
}

function cancelAnimations() {
  if (enemiesAnimationId !== null) cancelAnimationFrame(enemiesAnimationId);
  if (bulletsAnimationId !== null) cancelAnimationFrame(bulletsAnimationId);
  if (playerAnimationId !== null) cancelAnimationFrame(playerAnimationId);

  enemiesAnimationId = null;
  bulletsAnimationId = null;
  playerAnimationId = null;
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

  requestAnimations();
}
let currentTimer = 0;
document.addEventListener("keydown", (e) => {
  e.preventDefault();
  keysPressed[e.key] = true;
  currentTimer = parseInt(timerspan.textContent, 10);
  console.log(currentTimer);

  if (e.key.toLowerCase() === "p" && !isGameOver && !win) {
    isPaused = !isPaused;
    if (!isPaused) {
      lay_out_Pausse.style.display = "none";
      cancelAnimations();
      requestAnimations();
    } else {
      lay_out_Pausse.style.display = "flex";
      stopIncrement();
    }
  }
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

function requestAnimations() {
  enemiesAnimationId = requestAnimationFrame(updateEnemies);
  bulletsAnimationId = requestAnimationFrame(updateBullets);
  playerAnimationId = requestAnimationFrame(handlePlayerMovement);
  startIncrementId = requestAnimationFrame(startIncrement);
}

// Counter
let count = 0;
let timer_counter = null;
let timerspan = document.querySelector(".timer");
let minute = 0;
let second = 0;

function incrementCounter() {
  if (isPaused) {
    clearTimeout(timer_counter);
    timer_counter = null;
    return;
  } else {
    count++;
    if (count % 60 === 0) {
      minute = count / 60;
      second = count % 60;
    } else {
      // minute = Math.floor(count / 60);
      second = count % 60;
    }
    if (second >= 10) {
      timerspan.textContent = `0${minute}:${second}`;
    } else if (second < 10) {
      timerspan.textContent = `0${minute}:0${second}`;
    }
    timer_counter = setTimeout(incrementCounter, 1000);
  }
}

function startIncrement() {
  // timerspan.textContent = count;
  if (second >= 10) {
    timerspan.textContent = `0${minute}:${second}`;
  } else if (second < 10) {
    timerspan.textContent = `0${minute}:0${second}`;
  }
  if (timer_counter === null) {
    timer_counter = setTimeout(incrementCounter, 1000);
  }
}

function stopIncrement() {
  clearTimeout(timer_counter);
  timer_counter = null;
}
