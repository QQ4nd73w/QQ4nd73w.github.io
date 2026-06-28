(function (game) {
  'use strict';

  function paintInitialState() {
    game.renderer.clearCanvas();
    game.renderer.drawSnake();
    game.score.updateBestLabel();
    game.score.populateRecordsTable();
  }

  function boot() {
    game.renderer.fixCanvasSize();
    game.ui.setupThemeToggle();
    game.ui.setupDifficultySelect();
    game.core.configureMode();
    game.routing.redirectToMenuIfNeeded();
    game.ui.setupControls();
    game.input.setupInput();

    if (!game.routing.applyUrlSettings()) {
      paintInitialState();
    }
  }

  boot();
})(window.SnakeGame);
