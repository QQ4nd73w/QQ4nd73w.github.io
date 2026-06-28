(function (game) {
  'use strict';

  var state = game.state;
  var elements = game.elements;
  var utils = game.utils;

  function setupControls() {
    bindClick(elements.startBtn, game.core.startGame);
    bindClick(elements.restartBtn, game.core.restartGame);
    bindClick(elements.modalRestart, handleModalRestart);
    bindClick(elements.pauseBtn, togglePause);
    bindClick(elements.menuBtn, goToMenu);
    bindClick(elements.modalMenu, handleModalMenu);
    setupMuteButton();
  }

  function bindClick(element, handler) {
    if (element) {
      element.addEventListener('click', handler);
    }
  }

  function handleModalRestart(event) {
    event.stopPropagation();
    game.core.restartGame();
  }

  function handleModalMenu(event) {
    event.stopPropagation();
    goToMenu();
  }

  function togglePause() {
    if (state.gameRunning) {
      game.core.pauseGame();
      return;
    }

    game.core.resumeGame();
  }

  function goToMenu() {
    game.audio.stopGameMusic();
    window.location.href = 'menu.html';
  }

  function setupMuteButton() {
    refreshMuteButton();
    bindClick(elements.muteBtn, toggleMuted);
  }

  function toggleMuted() {
    var nextMuted = !state.isMuted;
    game.audio.setMuted(nextMuted);
    refreshMuteButton();

    if (!nextMuted && state.gameRunning) {
      game.audio.startGameMusic();
    }
  }

  function refreshMuteButton() {
    if (!elements.muteBtn) {
      return;
    }

    elements.muteBtn.textContent = state.isMuted ? '🔇' : '🔊';
    elements.muteBtn.classList.toggle('muted', state.isMuted);
  }

  function setupDifficultySelect() {
    var savedDifficulty = localStorage.getItem('snakeDifficulty') || 'normal';
    game.difficulty.applyDifficulty(savedDifficulty);

    if (!elements.difficultySelect) {
      return;
    }

    elements.difficultySelect.addEventListener('change', function (event) {
      game.difficulty.applyDifficulty(event.target.value);
    });
    elements.difficultySelect.addEventListener('keydown', suppressArrowKeys);
  }

  function suppressArrowKeys(event) {
    if (!event.key || !event.key.startsWith('Arrow')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function setupThemeToggle() {
    applyTheme(localStorage.getItem('snakeTheme') || 'light');
    bindClick(elements.themeToggle, toggleTheme);
  }

  function toggleTheme() {
    var nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  function applyTheme(theme) {
    var isDark = theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('snakeTheme', isDark ? 'dark' : 'light');
    updateThemeButton(isDark);
  }

  function updateThemeButton(isDark) {
    if (!elements.themeToggle) {
      return;
    }

    elements.themeToggle.textContent = isDark ? 'Светлая' : 'Тёмная';
    elements.themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  function updateBuffUI(now) {
    if (!elements.buffs) {
      return;
    }

    var timestamp = now || performance.now();
    var neutral = hasNeutralizedSpeed(timestamp);
    elements.buffs.innerHTML = '';
    getActiveBuffTypes(timestamp).forEach(function (type) {
      elements.buffs.appendChild(createBuffBadge(type, timestamp, neutral));
    });
    renderNeutralOverlay(neutral);
  }

  function getActiveBuffTypes(timestamp) {
    return Object.keys(state.activeBuffs).filter(function (type) {
      return state.activeBuffs[type] > timestamp;
    });
  }

  function hasNeutralizedSpeed(timestamp) {
    return game.buffs.isActive('speed', timestamp) && game.buffs.isActive('slow', timestamp);
  }

  function createBuffBadge(type, timestamp, neutral) {
    var display = game.buffs.getDisplay(type);
    var badge = document.createElement('div');
    var icon = document.createElement('span');
    var text = document.createElement('span');

    badge.className = 'buff-badge';
    badge.classList.toggle('buff-neutral', neutral);
    icon.className = 'buff-icon';
    icon.textContent = display.icon;
    text.textContent = getBuffText(display, type, timestamp, neutral);
    badge.appendChild(icon);
    badge.appendChild(text);
    return badge;
  }

  function getBuffText(display, type, timestamp, neutral) {
    var remaining = Math.ceil((state.activeBuffs[type] - timestamp) / 1000);
    return display.name + ' • ' + remaining + 'с' + (neutral ? ' (нейтр.)' : '');
  }

  function renderNeutralOverlay(neutral) {
    removeBuffOverlay();

    if (neutral && elements.container) {
      elements.container.appendChild(createNeutralOverlay());
    }
  }

  function createNeutralOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'buffOverlay';
    overlay.className = 'buff-badge buff-neutral';
    overlay.style.position = 'absolute';
    overlay.style.left = '50%';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.top = '72px';
    overlay.style.zIndex = 30;
    overlay.innerHTML = '<span class="buff-icon">⚡</span><span class="buff-icon">🐌</span><span style="margin-left:8px">Нейтрализация</span>';
    return overlay;
  }

  function removeBuffOverlay() {
    var overlay = document.getElementById('buffOverlay');

    if (overlay) {
      overlay.remove();
    }
  }

  function updateTimer(timestamp) {
    var remainingMs = Math.max(0, state.timedEnd - timestamp);
    var seconds = Math.ceil(remainingMs / 1000);
    utils.setText(elements.timer, 'Осталось: ' + seconds + 'с');
  }

  function clearTimer() {
    utils.setText(elements.timer, '');
  }

  function showGameOverModal() {
    removeBuffOverlay();
    state.isGameOver = true;
    state.gameRunning = false;
    state.isPaused = false;
    utils.setText(elements.finalScore, 'Счёт: ' + state.score);
    game.score.populateRecordsTable();
    showModal();
    game.audio.playGameOverSound();
    game.audio.stopGameMusic();
  }

  function showModal() {
    if (!elements.modal) {
      return;
    }

    elements.modal.classList.remove('hidden');
    elements.modal.setAttribute('aria-hidden', 'false');
    elements.modal.style.display = 'flex';
  }

  function hideGameOverModal() {
    if (!elements.modal) {
      return;
    }

    elements.modal.classList.add('hidden');
    elements.modal.setAttribute('aria-hidden', 'true');
    elements.modal.style.display = 'none';
    state.isGameOver = false;
  }

  function showPause() {
    state.isPaused = true;

    if (elements.pauseOverlay) {
      elements.pauseOverlay.classList.remove('hidden');
    }
  }

  function hidePause() {
    state.isPaused = false;

    if (elements.pauseOverlay) {
      elements.pauseOverlay.classList.add('hidden');
    }
  }

  game.ui = {
    clearTimer: clearTimer,
    goToMenu: goToMenu,
    hideGameOverModal: hideGameOverModal,
    hidePause: hidePause,
    removeBuffOverlay: removeBuffOverlay,
    setupControls: setupControls,
    setupDifficultySelect: setupDifficultySelect,
    setupThemeToggle: setupThemeToggle,
    showGameOverModal: showGameOverModal,
    showPause: showPause,
    updateBuffUI: updateBuffUI,
    updateTimer: updateTimer
  };
})(window.SnakeGame);
