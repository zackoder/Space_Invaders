let startTime = null;
let Pause = false;
let lastTime = null;

function timerAnimation(currentTime) {
  console.log("current time: ", Math.floor(currentTime / 1000));

  if (Pause) {
    if (!lastTime) {
      startTime = lastTime;
      console.log("lastTime", lastTime);
      lastTime = null;
      console.log("lastTime", lastTime);
    }
    if (!startTime) startTime = currentTime;
    const elapsedTime = (currentTime - startTime) / 1000;
    console.log(elapsedTime);
    requestAnimationFrame(timerAnimation);
  } else {
    lastTime = currentTime;
    console.log("last time: ", Math.floor(lastTime / 1000));
    return;
  }
}

document.addEventListener("click", () => {
  Pause = !Pause;
  requestAnimationFrame(timerAnimation);
  console.log(Pause);
});

requestAnimationFrame(timerAnimation);
