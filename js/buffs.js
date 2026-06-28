(function (game) {
  'use strict';

  var state = game.state;
  var elements = game.elements;
  var constants = game.constants;
  var utils = game.utils;

  var BUFF_WEIGHTS = [
    { type: 'x2', limit: 0.18 },
    { type: 'magnet', limit: 0.34 },
    { type: 'speed', limit: 0.70 },
    { type: 'slow', limit: 0.90 },
    { type: 'bigcoin', limit: 1 }
  ];

  var BUFF_DISPLAY = {
    x2: { icon: 'x2', name: 'Удвоение', fill: '#ffd24d', text: '#6a3b00' },
    magnet: { icon: 'М', name: 'Магнит', fill: '#8be0ff', text: '#003040' },
    speed: { icon: '⚡', name: 'Скорость', fill: '#ffd1ff', text: '#43003a' },
    slow: { icon: '🐌', name: 'Замедление', fill: '#cfe6d3', text: '#0b3a1a' },
    bigcoin: { icon: '+50', name: 'Большая монета', fill: '#ffe18a', text: '#6a3b00' }
  };

  function isActive(type, timestamp) {
    return state.activeBuffs[type] > timestamp;
  }

  function getDisplay(type) {
    return BUFF_DISPLAY[type] || BUFF_DISPLAY.x2;
  }

  function scheduleBuffs(timestamp) {
    if (!state.buffsEnabled) {
      return;
    }

    ensureNextBuffSpawn(timestamp);

    if (timestamp >= state.nextBuffSpawn) {
      spawnBuff(timestamp);
    }
  }

  function ensureNextBuffSpawn(timestamp) {
    if (state.nextBuffSpawn === 0) {
      scheduleNextBuff(timestamp);
    }
  }

  function scheduleNextBuff(timestamp) {
    state.nextBuffSpawn = timestamp + utils.randBetween(state.buffSpawnMin, state.buffSpawnMax);
  }

  function spawnBuff(timestamp) {
    var position = utils.randomFreeCell(getOccupiedCells());
    state.buffs.push(createBuff(position, timestamp));
    scheduleNextBuff(timestamp);
    game.renderer.fixCanvasSize();
  }

  function getOccupiedCells() {
    return state.snake.concat([{ x: state.foodX, y: state.foodY }]);
  }

  function createBuff(position, timestamp) {
    var visibleMs = getVisibleDuration(timestamp);

    return {
      x: position.x,
      y: position.y,
      type: pickBuffType(),
      spawn: timestamp,
      expires: timestamp + visibleMs
    };
  }

  function pickBuffType() {
    var roll = Math.random();
    return BUFF_WEIGHTS.find(function (item) {
      return roll < item.limit;
    }).type;
  }

  function getVisibleDuration(timestamp) {
    var slowOnly = isActive('slow', timestamp) && !isActive('speed', timestamp);
    return slowOnly ? Math.round(constants.BUFF_VISIBLE_MS * 1.5) : constants.BUFF_VISIBLE_MS;
  }

  function drawBuffs(now) {
    removeExpiredBuffs(now);
    state.buffs.forEach(function (buff) {
      drawBuff(buff, now);
    });
  }

  function removeExpiredBuffs(now) {
    state.buffs = state.buffs.filter(function (buff) {
      return now < buff.expires;
    });
  }

  function drawBuff(buff, now) {
    var ctx = elements.ctx;
    var center = getBuffCenter(buff);
    var display = getDisplay(buff.type);

    drawBuffCircle(ctx, center, display);
    drawBuffLabel(ctx, center, display.icon, display.text);
    drawBuffTimer(ctx, center, buff.expires - now);
  }

  function getBuffCenter(buff) {
    return {
      x: buff.x + constants.GRID_SIZE / 2,
      y: buff.y + constants.GRID_SIZE / 2
    };
  }

  function drawBuffCircle(ctx, center, display) {
    ctx.beginPath();
    ctx.fillStyle = display.fill;
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.arc(center.x, center.y, constants.GRID_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  function drawBuffLabel(ctx, center, icon, color) {
    ctx.fillStyle = color;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, center.x, center.y);
  }

  function drawBuffTimer(ctx, center, remainingMs) {
    var progress = Math.max(0, Math.min(1, remainingMs / constants.BUFF_VISIBLE_MS));

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    ctx.arc(center.x, center.y - 12, 6, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
    ctx.stroke();
    ctx.closePath();
  }

  function collectBuffsAtHead(timestamp) {
    var head = state.snake[0];

    if (!head) {
      return;
    }

    for (var index = state.buffs.length - 1; index >= 0; index -= 1) {
      collectBuffIfTouched(index, head, timestamp);
    }
  }

  function collectBuffIfTouched(index, head, timestamp) {
    var buff = state.buffs[index];

    if (!utils.samePosition(buff, head)) {
      return;
    }

    applyCollectedBuff(buff, timestamp);
    state.buffs.splice(index, 1);
  }

  function applyCollectedBuff(buff, timestamp) {
    if (buff.type === 'bigcoin') {
      game.score.addScore(constants.BIG_COIN_POINTS);
    } else {
      state.activeBuffs[buff.type] = timestamp + constants.BUFF_DURATION_MS;
    }

    game.audio.playBuffSound(buff.type);
    game.food.markEaten(buff.x, buff.y, timestamp);
  }

  function tryMagnetPickup(timestamp) {
    if (!isActive('magnet', timestamp) || !isFoodBesideHead()) {
      return false;
    }

    game.score.addFoodScore(timestamp);
    extendSnake();
    game.food.markEaten(state.foodX, state.foodY, timestamp);
    game.audio.playEatSound();
    game.food.createFood();
    return true;
  }

  function isFoodBesideHead() {
    var head = state.snake[0];

    if (!head || head.y !== state.foodY) {
      return false;
    }

    return Math.abs(state.foodX - head.x) === constants.GRID_SIZE;
  }

  function extendSnake() {
    var tail = state.snake[state.snake.length - 1];
    state.snake.push({ x: tail.x, y: tail.y });
  }

  function updateTickInterval(now) {
    var factor = getTickFactor(now);
    var nextInterval = Math.round(state.baseTickInterval * factor);
    state.tickInterval = factor < 1 ? Math.max(40, nextInterval) : nextInterval;
  }

  function getTickFactor(now) {
    var speed = isActive('speed', now);
    var slow = isActive('slow', now);

    if (speed === slow) {
      return 1;
    }

    return speed ? 0.6 : 1.5;
  }

  function reset() {
    state.buffs = [];
    state.nextBuffSpawn = 0;
    state.activeBuffs = {
      x2: 0,
      magnet: 0,
      speed: 0,
      slow: 0
    };
  }

  game.buffs = {
    collectBuffsAtHead: collectBuffsAtHead,
    drawBuffs: drawBuffs,
    getDisplay: getDisplay,
    isActive: isActive,
    reset: reset,
    scheduleBuffs: scheduleBuffs,
    tryMagnetPickup: tryMagnetPickup,
    updateTickInterval: updateTickInterval
  };
})(window.SnakeGame);
