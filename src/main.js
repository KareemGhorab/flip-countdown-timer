import './style.css';
import { CountdownTimer, formatParts } from './timer.js';
import { FlipClock } from './flipClock.js';
import { TickAudio, TICKS } from './audio.js';
import { THEMES, applyTheme, saveTheme, loadTheme } from './themes.js';
import { saveTimerState, loadTimerState } from './persistence.js';

const MUTE_KEY = 'fct.muted';
const VOLUME_KEY = 'fct.volume';
const TICK_KEY = 'fct.tick';
const CONTROLS_HIDE_MS = 2600;

const app = document.getElementById('app');
const clockRoot = document.getElementById('clock');
const inputs = {
  hh: document.getElementById('input-hh'),
  mm: document.getElementById('input-mm'),
  ss: document.getElementById('input-ss'),
};
const presets = document.getElementById('presets');
const themesRoot = document.getElementById('themes');

const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const btnMute = document.getElementById('btn-mute');
const btnFullscreen = document.getElementById('btn-fullscreen');
const volume = document.getElementById('volume');
const tickSelect = document.getElementById('tick-select');

// ---------- State ----------
const clock = new FlipClock(clockRoot);
const timer = new CountdownTimer();

const savedVolume = readNumber(VOLUME_KEY, 35);
const savedMuted = localStorage.getItem(MUTE_KEY) === 'true';
const savedTick = localStorage.getItem(TICK_KEY) || 'soft';
const audio = new TickAudio({ volume: savedVolume / 100, muted: savedMuted, tick: savedTick });

// ---------- Theme setup ----------
let activeTheme = applyTheme(loadTheme());
buildThemeSwatches();

// ---------- Audio UI sync ----------
volume.value = String(savedVolume);
updateMuteButton();
buildTickOptions();

// ---------- Timer wiring ----------
timer.onTick = (remaining, opts = {}) => {
  const parts = formatParts(remaining);
  const running = timer.state === 'running';
  clock.update(parts, { animate: running && !opts.silent });
  if (running && remaining > 0 && !opts.silent) audio.playTick();
  persistTimerState();
};

timer.onComplete = (opts = {}) => {
  persistTimerState();
  if (!opts.restored) audio.playComplete();
};

timer.onStateChange = (state) => {
  app.dataset.state = state;
  persistTimerState();
  if (state === 'running') {
    scheduleControlsHide();
  } else {
    showControls();
  }
};

restoreOrInit();

// ---------- Controls ----------
btnStart.addEventListener('click', () => {
  audio.resume();
  if (timer.state === 'idle' || timer.state === 'complete') {
    setFromInputs();
  }
  timer.start();
});

btnPause.addEventListener('click', () => {
  audio.resume();
  timer.pause();
});

btnReset.addEventListener('click', () => {
  timer.reset();
});

btnMute.addEventListener('click', () => {
  audio.resume();
  audio.setMuted(!audio.muted);
  localStorage.setItem(MUTE_KEY, String(audio.muted));
  updateMuteButton();
});

volume.addEventListener('input', () => {
  audio.resume();
  const v = clampInt(volume.value, 0, 100);
  audio.setVolume(v / 100);
  localStorage.setItem(VOLUME_KEY, String(v));
  if (audio.muted && v > 0) {
    audio.setMuted(false);
    localStorage.setItem(MUTE_KEY, 'false');
    updateMuteButton();
  }
});

tickSelect.addEventListener('change', () => {
  audio.resume();
  audio.setTick(tickSelect.value);
  localStorage.setItem(TICK_KEY, tickSelect.value);
  // Preview the chosen sound (unless muted or silent).
  audio.playTick();
});

btnFullscreen.addEventListener('click', () => {
  toggleFullscreen();
});

// Live-update the clock as inputs change (while not running).
for (const el of Object.values(inputs)) {
  el.addEventListener('input', () => {
    if (timer.state === 'running') return;
    setFromInputs();
  });
  el.addEventListener('change', normalizeInputs);
}

presets.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const minutes = clampInt(chip.dataset.minutes, 0, 5999);
  inputs.hh.value = pad(Math.floor(minutes / 60));
  inputs.mm.value = pad(minutes % 60);
  inputs.ss.value = '00';
  if (timer.state !== 'running') setFromInputs();
});

// ---------- Keyboard shortcuts ----------
document.addEventListener('keydown', (e) => {
  if (isTyping(e.target)) return;
  switch (e.key) {
    case ' ':
      e.preventDefault();
      audio.resume();
      if (timer.state === 'idle' || timer.state === 'complete') setFromInputs();
      timer.toggle();
      break;
    case 'r':
    case 'R':
      timer.reset();
      break;
    case 'm':
    case 'M':
      audio.resume();
      audio.setMuted(!audio.muted);
      localStorage.setItem(MUTE_KEY, String(audio.muted));
      updateMuteButton();
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
    default:
      break;
  }
});

// ---------- Auto-hide controls while focusing ----------
let hideTimeoutId = null;

function scheduleControlsHide() {
  clearTimeout(hideTimeoutId);
  hideTimeoutId = setTimeout(() => {
    if (timer.state === 'running') app.classList.add('controls-hidden');
  }, CONTROLS_HIDE_MS);
}

function showControls() {
  app.classList.remove('controls-hidden');
  clearTimeout(hideTimeoutId);
}

function onActivity() {
  if (app.classList.contains('controls-hidden')) {
    app.classList.remove('controls-hidden');
  }
  if (timer.state === 'running') scheduleControlsHide();
}

window.addEventListener('mousemove', onActivity);
window.addEventListener('touchstart', onActivity, { passive: true });
window.addEventListener('mousedown', onActivity);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (timer.state === 'running') {
    timer.sync();
    persistTimerState();
  }
});

window.addEventListener('pagehide', persistTimerState);

// ---------- Helpers ----------
function restoreOrInit() {
  const saved = loadTimerState();
  if (saved) {
    syncInputsFromSeconds(saved.inputSeconds ?? saved.totalSeconds);
    timer.restore({
      state: saved.state,
      totalSeconds: saved.totalSeconds,
      remaining: saved.remaining,
      deadline: saved.deadline,
    });
    return;
  }
  setFromInputs();
}

function persistTimerState() {
  const snapshot = timer.getSnapshot();
  saveTimerState({
    ...snapshot,
    inputSeconds: getTotalSeconds(),
  });
}

function syncInputsFromSeconds(totalSeconds) {
  const parts = formatParts(totalSeconds);
  inputs.hh.value = parts.hh;
  inputs.mm.value = parts.mm;
  inputs.ss.value = parts.ss;
}

function setFromInputs() {
  timer.set(getTotalSeconds());
}

function getTotalSeconds() {
  const hh = clampInt(inputs.hh.value, 0, 99);
  const mm = clampInt(inputs.mm.value, 0, 59);
  const ss = clampInt(inputs.ss.value, 0, 59);
  return hh * 3600 + mm * 60 + ss;
}

function normalizeInputs() {
  inputs.hh.value = pad(clampInt(inputs.hh.value, 0, 99));
  inputs.mm.value = pad(clampInt(inputs.mm.value, 0, 59));
  inputs.ss.value = pad(clampInt(inputs.ss.value, 0, 59));
  if (timer.state !== 'running') setFromInputs();
}

function buildThemeSwatches() {
  themesRoot.innerHTML = '';
  for (const theme of THEMES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.title = theme.name;
    btn.setAttribute('aria-label', `Theme: ${theme.name}`);
    btn.setAttribute('aria-pressed', String(theme.id === activeTheme));
    const card = theme.vars['--card'];
    const accent = theme.vars['--accent'];
    btn.style.background = `linear-gradient(135deg, ${card} 0 50%, ${accent} 50% 100%)`;
    btn.addEventListener('click', () => {
      activeTheme = applyTheme(theme.id);
      saveTheme(theme.id);
      refreshSwatchState();
    });
    themesRoot.appendChild(btn);
  }
}

function refreshSwatchState() {
  const buttons = themesRoot.querySelectorAll('.swatch');
  buttons.forEach((btn, i) => {
    btn.setAttribute('aria-pressed', String(THEMES[i].id === activeTheme));
  });
}

function buildTickOptions() {
  tickSelect.innerHTML = '';
  for (const t of TICKS) {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    tickSelect.appendChild(opt);
  }
  tickSelect.value = audio.tickId;
}

function updateMuteButton() {
  btnMute.classList.toggle('muted', audio.muted);
  btnMute.textContent = audio.muted ? '\u2014' : '\u266A';
  btnMute.title = audio.muted ? 'Sound off' : 'Sound on';
  btnMute.setAttribute('aria-pressed', String(audio.muted));
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}

function isTyping(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function clampInt(value, min, max) {
  let n = parseInt(value, 10);
  if (Number.isNaN(n)) n = 0;
  return Math.min(max, Math.max(min, n));
}

function readNumber(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? fallback : n;
}
