(function (game) {
  'use strict';

  var state = game.state;
  var constants = game.constants;

  var DIRECTIONS = [
    { keys: ['arrowleft', 'a'], code: 'KeyA', keyCode: 37, dx: -constants.GRID_SIZE, dy: 0 },
    { keys: ['arrowup', 'w'], code: 'KeyW', keyCode: 38, dx: 0, dy: -constants.GRID_SIZE },
    { keys: ['arrowright', 'd'], code: 'KeyD', keyCode: 39, dx: constants.GRID_SIZE, dy: 0 },
    { keys: ['arrowdown', 's'], code: 'KeyS', keyCode: 40, dx: 0, dy: constants.GRID_SIZE }
  ];

  function setupInput() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onEscape);
  }

  function onKeyDown(event) {
    if (isSpace(event)) {
      handleSpace(event);
      return;
    }

    changeDirection(event);
  }

  function handleSpace(event) {
    event.preventDefault();

    if (state.isGameOver) {
      game.core.restartGame();
      return;
    }

    if (state.gameRunning) {
      game.core.pauseGame();
      return;
    }

    game.core.resumeGame();
  }

  function changeDirection(event) {
    var nextDirection = getPressedDirection(event);

    if (state.changingDirection || !nextDirection || isReverse(nextDirection)) {
      return;
    }

    state.dx = nextDirection.dx;
    state.dy = nextDirection.dy;
    state.changingDirection = true;
  }

  function getPressedDirection(event) {
    return DIRECTIONS.find(function (direction) {
      return matchesDirection(event, direction);
    });
  }

  function matchesDirection(event, direction) {
    var key = (event.key || '').toLowerCase();
    return direction.keys.indexOf(key) !== -1 || event.code === direction.code || event.keyCode === direction.keyCode;
  }

  function isReverse(direction) {
    return state.dx + direction.dx === 0 && state.dy + direction.dy === 0;
  }

  function isSpace(event) {
    return event.code === 'Space' || event.key === ' ' || event.keyCode === 32;
  }

  function onEscape(event) {
    if (event.key !== 'Escape') {
      return;
    }

    if (state.gameRunning) {
      game.core.pauseGame();
    }

    game.ui.goToMenu();
  }

  game.input = {
    changeDirection: changeDirection,
    setupInput: setupInput
  };
})(window.SnakeGame);
