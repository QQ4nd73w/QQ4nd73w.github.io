(function (game) {
  'use strict';

  var state = game.state;
  var elements = game.elements;

  var DIFFICULTIES = {
    easy: { baseTickInterval: 140, buffSpawnMin: 8000, buffSpawnMax: 20000, startLength: 7 },
    normal: { baseTickInterval: 100, buffSpawnMin: 5000, buffSpawnMax: 15000, startLength: 5 },
    hard: { baseTickInterval: 70, buffSpawnMin: 3000, buffSpawnMax: 12000, startLength: 4 },
    insane: { baseTickInterval: 40, buffSpawnMin: 2000, buffSpawnMax: 8000, startLength: 3 }
  };

  function applyDifficulty(level) {
    var selectedLevel = normalizeLevel(level);
    var config = DIFFICULTIES[selectedLevel];

    localStorage.setItem('snakeDifficulty', selectedLevel);
    state.baseTickInterval = config.baseTickInterval;
    state.tickInterval = config.baseTickInterval;
    state.buffSpawnMin = config.buffSpawnMin;
    state.buffSpawnMax = config.buffSpawnMax;
    state.startLength = config.startLength;
    setDifficultySelectValue(selectedLevel);
  }

  function applyInsaneSpawnSettings() {
    state.buffSpawnMin = 150;
    state.buffSpawnMax = 250;
    state.startLength = 3;
  }

  function normalizeLevel(level) {
    return DIFFICULTIES[level] ? level : 'normal';
  }

  function setDifficultySelectValue(level) {
    if (elements.difficultySelect) {
      elements.difficultySelect.value = level;
    }
  }

  game.difficulty = {
    applyDifficulty: applyDifficulty,
    applyInsaneSpawnSettings: applyInsaneSpawnSettings
  };
})(window.SnakeGame);
