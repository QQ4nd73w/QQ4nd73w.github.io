(function (game) {
  'use strict';

  var state = game.state;
  var elements = game.elements;
  var utils = game.utils;
  var RECORDS_KEY = 'snakeScores';

  function setScore(value) {
    state.score = value;
    utils.setText(elements.score, 'Счёт: ' + state.score);
  }

  function addScore(points) {
    setScore(state.score + points);
  }

  function addFoodScore(timestamp) {
    addScore(game.constants.FOOD_POINTS * getScoreMultiplier(timestamp));
  }

  function getScoreMultiplier(timestamp) {
    return state.activeBuffs.x2 > timestamp ? 2 : 1;
  }

  function updateBestLabel() {
    utils.setText(elements.best, 'Рекорд: ' + state.bestScore);
  }

  function updateBestIfNeeded() {
    if (state.score <= state.bestScore) {
      return;
    }

    state.bestScore = state.score;
    localStorage.setItem('snakeBest', state.bestScore);
    updateBestLabel();
  }

  function saveScoreToRecords(value) {
    var records = readRecords();
    records.push({ score: value, date: new Date().toISOString() });
    records.sort(function (first, second) {
      return second.score - first.score;
    });

    var topRecords = records.slice(0, 10);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(topRecords));
    return topRecords;
  }

  function readRecords() {
    try {
      var parsed = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function populateRecordsTable() {
    var tableBody = elements.recordsTableBody;

    if (!tableBody) {
      return;
    }

    tableBody.innerHTML = '';
    readRecords().forEach(function (record, index) {
      tableBody.appendChild(createRecordRow(record, index));
    });

    if (!tableBody.children.length) {
      tableBody.appendChild(createEmptyRecordRow());
    }
  }

  function createRecordRow(record, index) {
    var row = document.createElement('tr');
    var date = new Date(record.date);
    row.innerHTML = '<td>' + (index + 1) + '</td><td>' + record.score + '</td><td>' + date.toLocaleString() + '</td>';
    return row;
  }

  function createEmptyRecordRow() {
    var row = document.createElement('tr');
    row.innerHTML = '<td colspan="3">— записей нет —</td>';
    return row;
  }

  game.score = {
    addFoodScore: addFoodScore,
    addScore: addScore,
    populateRecordsTable: populateRecordsTable,
    saveScoreToRecords: saveScoreToRecords,
    setScore: setScore,
    updateBestIfNeeded: updateBestIfNeeded,
    updateBestLabel: updateBestLabel
  };
})(window.SnakeGame);
