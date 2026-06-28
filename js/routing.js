(function (game) {
  'use strict';

  var state = game.state;

  function redirectToMenuIfNeeded() {
    try {
      var seen = localStorage.getItem('snakeSeenMenu');
      var isMenuPage = window.location.pathname.endsWith('menu.html') || window.location.pathname.endsWith('/menu.html');

      if (!seen && !isMenuPage) {
        window.location.href = 'menu.html';
      }
    } catch (error) {}
  }

  function applyUrlSettings() {
    try {
      var params = new URLSearchParams(window.location.search);
      var mode = params.get('mode');
      var difficulty = params.get('difficulty');

      if (!mode && !difficulty) {
        return false;
      }

      applyMode(mode);
      applyDifficulty(difficulty);
      history.replaceState(null, '', window.location.pathname);
      game.core.configureMode();
      game.core.restartGame();
      return true;
    } catch (error) {
      return false;
    }
  }

  function applyMode(mode) {
    if (!mode) {
      return;
    }

    state.gameMode = mode;
    localStorage.setItem('snakeMode', mode);
  }

  function applyDifficulty(difficulty) {
    if (difficulty) {
      game.difficulty.applyDifficulty(difficulty);
    }
  }

  game.routing = {
    applyUrlSettings: applyUrlSettings,
    redirectToMenuIfNeeded: redirectToMenuIfNeeded
  };
})(window.SnakeGame);
