(function (game) {
  'use strict';

  var constants = game.constants;

  function createStartingSnake(length) {
    var headX = 150;
    var headY = 150;
    var snake = [];

    for (var index = 0; index < length; index += 1) {
      snake.push({ x: headX - index * constants.GRID_SIZE, y: headY });
    }

    return snake;
  }

  function cloneSnake(snake) {
    return snake.map(function (part) {
      return { x: part.x, y: part.y };
    });
  }

  function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomTen(min, max) {
    return Math.round((Math.random() * (max - min) + min) / constants.GRID_SIZE) * constants.GRID_SIZE;
  }

  function samePosition(first, second) {
    return first.x === second.x && first.y === second.y;
  }

  function isOccupied(position, occupiedPositions) {
    return occupiedPositions.some(function (occupied) {
      return samePosition(position, occupied);
    });
  }

  function randomFreeCell(occupiedPositions) {
    var canvas = game.elements.canvas;
    var maxX = canvas.width - constants.GRID_SIZE;
    var maxY = canvas.height - constants.GRID_SIZE;
    var position = { x: 0, y: 0 };

    for (var attempt = 0; attempt < 500; attempt += 1) {
      position = { x: randomTen(0, maxX), y: randomTen(0, maxY) };

      if (!isOccupied(position, occupiedPositions)) {
        return position;
      }
    }

    return position;
  }

  function shadeColor(hex, percent) {
    try {
      var value = parseInt(hex.replace('#', ''), 16);
      var amount = Math.round(2.55 * percent);
      var red = clampColor(((value >> 16) & 0xFF) + amount);
      var green = clampColor(((value >> 8) & 0xFF) + amount);
      var blue = clampColor((value & 0xFF) + amount);

      return '#' + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
    } catch (error) {
      return hex;
    }
  }

  function clampColor(value) {
    return Math.max(0, Math.min(255, value));
  }

  function setText(element, text) {
    if (element) {
      element.textContent = text;
    }
  }

  game.utils = {
    createStartingSnake: createStartingSnake,
    cloneSnake: cloneSnake,
    randBetween: randBetween,
    randomFreeCell: randomFreeCell,
    randomTen: randomTen,
    samePosition: samePosition,
    shadeColor: shadeColor,
    setText: setText
  };
})(window.SnakeGame);
