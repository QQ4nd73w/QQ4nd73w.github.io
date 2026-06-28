(function (game) {
  'use strict';

  var state = game.state;
  var elements = game.elements;
  var constants = game.constants;
  var utils = game.utils;

  var SNAKE_PARTS = [
    { fill: '#ffffff', stroke: { light: '#d0d0d0', dark: '#cfcfcf' } },
    { fill: '#0039a6', stroke: { light: '#002b66', dark: '#03223f' } },
    { fill: '#d52b1e', stroke: { light: '#7a1b16', dark: '#4a120f' } }
  ];

  var FALLBACK_PART = {
    fill: { light: '#9fe59f', dark: '#7ee7c7' },
    stroke: { light: '#196619', dark: '#0b5a51' }
  };

  function fixCanvasSize() {
    var canvas = elements.canvas;

    if (!canvas) {
      return;
    }

    canvas.width = constants.CANVAS_SIZE;
    canvas.height = constants.CANVAS_SIZE;
    canvas.style.width = constants.CANVAS_SIZE + 'px';
    canvas.style.height = constants.CANVAS_SIZE + 'px';
  }

  function clearCanvas() {
    var canvas = elements.canvas;
    var ctx = elements.ctx;
    var theme = getCanvasTheme();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme.fill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = theme.stroke;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  function getCanvasTheme() {
    if (isDarkTheme()) {
      return { fill: 'rgba(7,17,38,0.45)', stroke: 'rgba(255,255,255,0.06)' };
    }

    return { fill: 'rgba(255,255,255,0.35)', stroke: 'rgba(0,0,0,0.06)' };
  }

  function isDarkTheme() {
    return document.body.classList.contains('dark');
  }

  function drawSnakePartAt(x, y, index) {
    var ctx = elements.ctx;
    var colors = getSnakePartColors(index);
    var gradient = ctx.createLinearGradient(x, y, x + constants.GRID_SIZE, y + constants.GRID_SIZE);

    drawRoundedCellPath(ctx, x, y);
    gradient.addColorStop(0, colors.fill);
    gradient.addColorStop(1, getHighlight(colors.fill));
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.stroke;
    ctx.stroke();
  }

  function drawRoundedCellPath(ctx, x, y) {
    var size = constants.GRID_SIZE;
    var radius = 3;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + size, y, x + size, y + size, radius);
    ctx.arcTo(x + size, y + size, x, y + size, radius);
    ctx.arcTo(x, y + size, x, y, radius);
    ctx.arcTo(x, y, x + size, y, radius);
    ctx.closePath();
  }

  function getSnakePartColors(index) {
    var part = typeof index === 'number' ? SNAKE_PARTS[index % SNAKE_PARTS.length] : FALLBACK_PART;
    var fill = typeof part.fill === 'string' ? part.fill : part.fill[getThemeName()];

    return {
      fill: fill,
      stroke: part.stroke[getThemeName()]
    };
  }

  function getThemeName() {
    return isDarkTheme() ? 'dark' : 'light';
  }

  function getHighlight(fill) {
    return fill === '#ffffff' ? 'rgba(255,255,255,0.6)' : utils.shadeColor(fill, 10);
  }

  function drawSnake() {
    state.snake.forEach(function (part, index) {
      drawSnakePartAt(part.x, part.y, index);
    });
  }

  function drawHeadEyes(x, y) {
    var ctx = elements.ctx;
    var directionX = state.dx === 0 ? 0 : Math.sign(state.dx);
    var directionY = state.dy === 0 ? 0 : Math.sign(state.dy);
    var eyeX = x + 3 + directionX * 2;
    var eyeY = y + 3 + directionY * 2;

    drawEye(ctx, eyeX, eyeY);
    drawEye(ctx, eyeX + 4 * directionX, eyeY + 4 * directionY);
  }

  function drawEye(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = '#111';
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  function render(now) {
    clearCanvas();
    game.food.drawFood(now);
    game.buffs.drawBuffs(now);
    drawSnakeFrame(now);
  }

  function drawSnakeFrame(now) {
    if (state.animating && state.prevSnake) {
      drawAnimatedSnake(now);
      return;
    }

    drawSnake();
    drawEyesForHead();
  }

  function drawAnimatedSnake(now) {
    var progress = getAnimationProgress(now);

    state.snake.forEach(function (part, index) {
      var point = getInterpolatedSnakePoint(index, progress);
      drawSnakePartAt(point.x, point.y, index);

      if (index === 0) {
        drawHeadEyes(point.x, point.y);
      }
    });

    state.animating = progress < 1;
  }

  function getAnimationProgress(now) {
    return Math.min(1, (now - state.animStart) / state.tickInterval);
  }

  function getInterpolatedSnakePoint(index, progress) {
    var previous = state.prevSnake[index] || state.prevSnake[state.prevSnake.length - 1];
    var current = state.snake[index] || state.snake[state.snake.length - 1];

    return {
      x: previous.x + (current.x - previous.x) * progress,
      y: previous.y + (current.y - previous.y) * progress
    };
  }

  function drawEyesForHead() {
    if (state.snake.length) {
      drawHeadEyes(state.snake[0].x, state.snake[0].y);
    }
  }

  game.renderer = {
    clearCanvas: clearCanvas,
    drawSnake: drawSnake,
    drawSnakePartAt: drawSnakePartAt,
    fixCanvasSize: fixCanvasSize,
    render: render
  };
})(window.SnakeGame);
