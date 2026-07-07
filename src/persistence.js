/**
 * Persist countdown state in localStorage so the timer survives refresh and
 * can be restored after the tab or machine sleeps.
 */

const STORAGE_KEY = 'fct.timer';

/**
 * @typedef {Object} TimerSnapshot
 * @property {'idle'|'running'|'paused'|'complete'} state
 * @property {number} totalSeconds
 * @property {number} remaining
 * @property {number|null} deadline - absolute end time (ms) while running
 * @property {number} inputSeconds - last configured duration for the inputs
 */

/** @param {TimerSnapshot} snapshot */
export function saveTimerState(snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage full or unavailable */
  }
}

/** @returns {TimerSnapshot|null} */
export function loadTimerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    if (!['idle', 'running', 'paused', 'complete'].includes(data.state)) return null;
    return {
      state: data.state,
      totalSeconds: clampInt(data.totalSeconds, 0, 99 * 3600 + 59 * 60 + 59),
      remaining: clampInt(data.remaining, 0, 99 * 3600 + 59 * 60 + 59),
      deadline: typeof data.deadline === 'number' ? data.deadline : null,
      inputSeconds: clampInt(data.inputSeconds, 0, 99 * 3600 + 59 * 60 + 59),
    };
  } catch {
    return null;
  }
}

export function clearTimerState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function clampInt(value, min, max) {
  const n = Math.floor(Number(value));
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}
