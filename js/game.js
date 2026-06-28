(function (game) {
  'use strict';

  var state = game.state;
  var elements = game.elements;
  var constants = game.constants;
  var utils = game.utils;

  function configureMode() {
    state.gameMode = state.gameMode || localStorage.getItem('snakeMode') || 'classic';
    state.buffsEnabled = state.gameMode !== 'nobuffs';

    if (state.gameMode === 'insane') {
      game.difficulty.applyInsaneSpawnSettings();
    }
  }

  function startGame() {
    if (state.gameRunning) {
      return;
    }

    prepareGameStart();
    requestAnimationFrame(gameLoop);
  }

  function prepareGameStart() {
    game.ui.hideGameOverModal();
    game.ui.hidePause();
    state.isGameOver = false;
    state.gameRunning = true;
    game.score.setScore(0);
    ensureSnakeLength();
    resetRoundState();
    game.food.createFood();
    startTimedMode();
    game.audio.startGameMusic();
  }

  function ensureSnakeLength() {
    if (state.snake && state.snake.length === state.startLength) {
      return;
    }

    resetSnake();
  }

  function resetSnake() {
    state.snake = utils.createStartingSnake(state.startLength);
    state.dx = constants.GRID_SIZE;
    state.dy = 0;
  }

  function resetRoundState() {
    state.prevSnake = null;
    state.animStart = 0;
    state.lastTick = 0;
    state.animating = false;
    state.changingDirection = false;
    game.food.clearEatBurst();
    game.buffs.reset();
  }

  function startTimedMode() {
    if (state.gameMode === 'timed') {
      state.timedEnd = performance.now() + constants.TIMED_MODE_MS;
      return;
    }

    state.timedEnd = 0;
    game.ui.clearTimer();
  }

  function pauseGame() {
    if (!state.gameRunning) {
      return;
    }

    state.gameRunning = false;
    game.ui.showPause();
    game.audio.pauseGameMusic();
  }

  function resumeGame() {
    if (state.gameRunning) {
      return;
    }

    game.ui.hidePause();
    state.gameRunning = true;
    state.lastTick = 0;
    requestAnimationFrame(gameLoop);
    game.audio.resumeGameMusic();
  }

  function restartGame() {
    game.ui.hideGameOverModal();
    game.ui.hidePause();
    state.gameRunning = false;
    resetSnake();
    game.score.setScore(0);
    game.renderer.clearCanvas();
    game.renderer.drawSnake();
    startGame();
  }

  function gameLoop(timestamp) {
    if (!state.gameRunning) {
      return;
    }

    if (finishIfEnded()) {
      return;
    }

    setInitialTick(timestamp);
    runTickIfReady(timestamp);
    game.ui.updateBuffUI(timestamp);
    game.audio.applyGameAudioRate(timestamp);

    if (finishIfTimedOut(timestamp)) {
      return;
    }

    game.renderer.render(timestamp);
    requestAnimationFrame(gameLoop);
  }

  function finishIfEnded() {
    if (!didGameEnd()) {
      return false;
    }

    finishGame();
    return true;
  }

  function setInitialTick(timestamp) {
    if (!state.lastTick) {
      state.lastTick = timestamp;
    }
  }

  function runTickIfReady(timestamp) {
    if (timestamp - state.lastTick < state.tickInterval) {
      return;
    }

    state.lastTick = timestamp;
    runTick(timestamp);
  }

  function runTick(timestamp) {
    rememberSnake();
    state.changingDirection = false;
    game.buffs.updateTickInterval(timestamp);
    game.buffs.scheduleBuffs(timestamp);
    game.buffs.tryMagnetPickup(timestamp);
    handleMoveResult(advanceSnake(timestamp), timestamp);
    game.buffs.collectBuffsAtHead(timestamp);
    game.renderer.fixCanvasSize();
    game.buffs.tryMagnetPickup(timestamp);
  }

  function rememberSnake() {
    state.prevSnake = utils.cloneSnake(state.snake);
  }

  function advanceSnake(timestamp) {
    var head = {
      x: state.snake[0].x + state.dx,
      y: state.snake[0].y + state.dy
    };
    var didEatFood = head.x === state.foodX && head.y === state.foodY;

    state.snake.unshift(head);

    if (didEatFood) {
      game.score.addFoodScore(timestamp);
    } else {
      state.snake.pop();
    }

    return didEatFood;
  }

  function handleMoveResult(didEatFood, timestamp) {
    state.animStart = timestamp;
    state.animating = true;

    if (!didEatFood) {
      game.food.clearEatBurst();
      return;
    }

    game.food.markEaten(state.foodX, state.foodY, timestamp);
    game.food.createFood();
    game.audio.playEatSound();
  }

  function didGameEnd() {
    return hitSelf() || hitWall();
  }

  function hitSelf() {
    var head = state.snake[0];

    return state.snake.slice(4).some(function (part) {
      return utils.samePosition(part, head);
    });
  }

  function hitWall() {
    var head = state.snake[0];
    var max = elements.canvas.width - constants.GRID_SIZE;

    return head.x < 0 || head.x > max || head.y < 0 || head.y > max;
  }

  function finishIfTimedOut(timestamp) {
    if (state.gameMode !== 'timed' || !state.timedEnd) {
      return false;
    }

    game.ui.updateTimer(timestamp);

    if (timestamp < state.timedEnd) {
      return false;
    }

    finishGame();
    return true;
  }

  function finishGame() {
    state.gameRunning = false;
    game.score.updateBestIfNeeded();
    game.score.saveScoreToRecords(state.score);
    game.ui.showGameOverModal();
  }

  game.core = {
    configureMode: configureMode,
    pauseGame: pauseGame,
    restartGame: restartGame,
    resumeGame: resumeGame,
    startGame: startGame
  };
})(window.SnakeGame);
