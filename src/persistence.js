/**
 * Session persistence for the countdown.
 *
 * Stores only the remaining time (not an absolute deadline), so sleeping the
 * machine or refreshing the page freezes the timer and lets the user resume
 * from the same point instead of burning through the countdown.
 */

const SESSION_KEY = 'fct.session';
const MAX_SECONDS = 99 * 3600 + 59 * 60 + 59;

/** @param {{ remaining: number, totalSeconds: number }} session */
export function saveSession(session) {
  try {
    const payload = {
      remaining: clampSeconds(session.remaining),
      totalSeconds: clampSeconds(session.totalSeconds),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable (private mode / quota); ignore */
  }
}

/** @returns {{ remaining: number, totalSeconds: number } | null} */
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const remaining = clampSeconds(data.remaining);
    const totalSeconds = clampSeconds(data.totalSeconds);
    if (remaining <= 0 || totalSeconds <= 0) return null;
    return { remaining, totalSeconds };
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function clampSeconds(value) {
  const n = Math.floor(Number(value));
  if (Number.isNaN(n)) return 0;
  return Math.min(MAX_SECONDS, Math.max(0, n));
}
