(function (game) {
  'use strict';

  var state = game.state;
  var elements = game.elements;
  var constants = game.constants;
  var utils = game.utils;
  var EAT_BURST_MS = 300;

  function createFood() {
    var position = utils.randomFreeCell(state.snake);
    state.foodX = position.x;
    state.foodY = position.y;
  }

  function drawFood(now) {
    drawEatBurst(now);
    drawFoodBody();
    drawFoodHighlight();
    drawFoodStem();
  }

  function drawEatBurst(now) {
    if (!state.lastEaten) {
      return;
    }

    var elapsed = now - state.lastEaten.start;

    if (elapsed >= EAT_BURST_MS) {
      return;
    }

    var ctx = elements.ctx;
    var progress = elapsed / EAT_BURST_MS;
    var opacity = 1 - progress;
    var scale = 1 + 0.8 * opacity;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,90,90,' + opacity + ')';
    ctx.arc(state.lastEaten.x + 5, state.lastEaten.y + 5, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  function drawFoodBody() {
    var ctx = elements.ctx;
    var center = getFoodCenter();
    var bodyColor = document.body.classList.contains('dark') ? '#ff8b8b' : '#ff3b3b';

    ctx.beginPath();
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.arc(center.x, center.y, constants.GRID_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  function drawFoodHighlight() {
    var ctx = elements.ctx;
    var center = getFoodCenter();

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.ellipse(center.x - 2, center.y - 3, 3, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  function drawFoodStem() {
    var ctx = elements.ctx;
    var center = getFoodCenter();
    var dark = document.body.classList.contains('dark');

    ctx.beginPath();
    ctx.strokeStyle = dark ? '#2b6b2b' : '#2b8a2b';
    ctx.lineWidth = 2;
    ctx.moveTo(center.x + 1, center.y - 6);
    ctx.lineTo(center.x + 3, center.y - 10);
    ctx.stroke();
    ctx.closePath();
  }

  function getFoodCenter() {
    return {
      x: state.foodX + constants.GRID_SIZE / 2,
      y: state.foodY + constants.GRID_SIZE / 2
    };
  }

  function markEaten(x, y, timestamp) {
    state.lastEaten = { x: x, y: y, start: timestamp };
  }

  function clearEatBurst() {
    state.lastEaten = null;
  }

  game.food = {
    clearEatBurst: clearEatBurst,
    createFood: createFood,
    drawFood: drawFood,
    markEaten: markEaten
  };
})(window.SnakeGame);
