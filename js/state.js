(function (window) {
  'use strict';

  var game = window.SnakeGame = window.SnakeGame || {};
  var canvas = document.getElementById('gameCanvas');

  game.elements = {
    canvas: canvas,
    ctx: canvas ? canvas.getContext('2d') : null,
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn'),
    menuBtn: document.getElementById('menuBtn'),
    modalMenu: document.getElementById('modalMenu'),
    themeToggle: document.getElementById('themeToggle'),
    modal: document.getElementById('gameOverModal'),
    finalScore: document.getElementById('finalScore'),
    recordsTableBody: document.querySelector('#recordsTable tbody'),
    modalRestart: document.getElementById('modalRestart'),
    pauseOverlay: document.getElementById('pauseOverlay'),
    muteBtn: document.getElementById('muteBtn'),
    difficultySelect: document.getElementById('difficultySelect'),
    timer: document.getElementById('timer'),
    buffs: document.getElementById('buffs'),
    container: document.querySelector('.container')
  };

  game.constants = {
    GRID_SIZE: 10,
    CANVAS_SIZE: 300,
    BUFF_VISIBLE_MS: 5000,
    BUFF_DURATION_MS: 20000,
    TIMED_MODE_MS: 60000,
    FOOD_POINTS: 10,
    BIG_COIN_POINTS: 50
  };

  game.state = {
    snake: [
      { x: 150, y: 150 },
      { x: 140, y: 150 },
      { x: 130, y: 150 },
      { x: 120, y: 150 },
      { x: 110, y: 150 }
    ],
    dx: 10,
    dy: 0,
    foodX: 0,
    foodY: 0,
    score: 0,
    bestScore: parseInt(localStorage.getItem('snakeBest'), 10) || 0,
    changingDirection: false,
    gameRunning: false,
    isGameOver: false,
    isPaused: false,
    prevSnake: null,
    animStart: 0,
    baseTickInterval: 100,
    tickInterval: 100,
    lastTick: 0,
    animating: false,
    lastEaten: null,
    buffs: [],
    nextBuffSpawn: 0,
    activeBuffs: {
      x2: 0,
      magnet: 0,
      speed: 0,
      slow: 0
    },
    isMuted: localStorage.getItem('snakeMuted') === 'true',
    buffSpawnMin: 5000,
    buffSpawnMax: 15000,
    startLength: 5,
    gameMode: localStorage.getItem('snakeMode') || 'classic',
    timedEnd: 0,
    buffsEnabled: true
  };
})(window);
