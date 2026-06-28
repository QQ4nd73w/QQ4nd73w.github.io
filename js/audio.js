(function (game) {
  'use strict';

  var state = game.state;
  var audioContext = null;
  var gameAudio = null;
  var gameAudioRateCurrent = 1;
  var gameAudioRateTarget = 1;
  var gameAudioSmoothing = 0.12;

  var BUFF_TONES = {
    x2: [
      [1200, 'sine', 0.12, 0.09],
      [1600, 'sine', 0.08, 0.06]
    ],
    magnet: [
      [900, 'triangle', 0.14, 0.08],
      [700, 'sine', 0.1, 0.06]
    ],
    speed: [
      [1500, 'sawtooth', 0.12, 0.08]
    ],
    slow: [
      [320, 'sine', 0.2, 0.08]
    ],
    bigcoin: [
      [1800, 'square', 0.12, 0.12],
      [2200, 'sine', 0.08, 0.06]
    ],
    fallback: [
      [1040, 'square', 0.12, 0.08],
      [780, 'sine', 0.09, 0.06]
    ]
  };

  function ensureAudio() {
    if (audioContext) {
      return audioContext;
    }

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      audioContext = null;
    }

    return audioContext;
  }

  function playTone(frequency, type, duration, volume) {
    var audio = ensureAudio();

    if (state.isMuted || !audio) {
      return;
    }

    var oscillator = audio.createOscillator();
    var gain = audio.createGain();
    var now = audio.currentTime;

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.stop(now + duration + 0.02);
  }

  function playToneSequence(tones) {
    tones.forEach(function (tone) {
      playTone(tone[0], tone[1], tone[2], tone[3]);
    });
  }

  function playEatSound() {
    playToneSequence([
      [880, 'sine', 0.14, 0.09],
      [1320, 'sine', 0.08, 0.06]
    ]);
  }

  function playGameOverSound() {
    playToneSequence([
      [240, 'triangle', 0.45, 0.12],
      [160, 'sawtooth', 0.45, 0.08]
    ]);
  }

  function playBuffSound(type) {
    playToneSequence(BUFF_TONES[type] || BUFF_TONES.fallback);
  }

  function computeMusicRate(now) {
    var speed = state.activeBuffs.speed > now;
    var slow = state.activeBuffs.slow > now;

    if (speed === slow) {
      return 1;
    }

    return speed ? 1.4 : 0.7;
  }

  function applyGameAudioRate(now) {
    if (!gameAudio) {
      return;
    }

    try {
      gameAudioRateTarget = computeMusicRate(now);
      gameAudioRateCurrent += (gameAudioRateTarget - gameAudioRateCurrent) * gameAudioSmoothing;
      gameAudioRateCurrent = Math.max(0.25, Math.min(4, gameAudioRateCurrent));
      gameAudio.playbackRate = gameAudioRateCurrent;
    } catch (error) {
      gameAudio = null;
    }
  }

  function startGameMusic() {
    if (state.isMuted || gameAudio) {
      return;
    }

    try {
      gameAudio = new Audio('game.mp3');
      gameAudio.loop = true;
      gameAudio.volume = 0.12;
      gameAudioRateCurrent = computeMusicRate(performance.now());
      gameAudioRateTarget = gameAudioRateCurrent;
      gameAudio.playbackRate = gameAudioRateCurrent;
      gameAudio.play().catch(function () {});
    } catch (error) {
      gameAudio = null;
    }
  }

  function pauseGameMusic() {
    if (gameAudio) {
      gameAudio.pause();
    }
  }

  function resumeGameMusic() {
    if (state.isMuted) {
      return;
    }

    if (gameAudio) {
      gameAudio.play().catch(function () {});
      return;
    }

    startGameMusic();
  }

  function stopGameMusic() {
    if (!gameAudio) {
      return;
    }

    try {
      gameAudio.pause();
      gameAudio.currentTime = 0;
    } catch (error) {
      gameAudio = null;
    }

    gameAudio = null;
  }

  function setMuted(isMuted) {
    state.isMuted = isMuted;
    localStorage.setItem('snakeMuted', String(isMuted));

    if (isMuted) {
      stopGameMusic();
    }
  }

  game.audio = {
    applyGameAudioRate: applyGameAudioRate,
    playBuffSound: playBuffSound,
    playEatSound: playEatSound,
    playGameOverSound: playGameOverSound,
    pauseGameMusic: pauseGameMusic,
    resumeGameMusic: resumeGameMusic,
    setMuted: setMuted,
    startGameMusic: startGameMusic,
    stopGameMusic: stopGameMusic
  };
})(window.SnakeGame);
