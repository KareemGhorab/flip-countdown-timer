/**
 * Drift-corrected countdown engine.
 *
 * Instead of a naive setInterval(fn, 1000) — which accumulates error and drifts
 * badly over long focus sessions — this schedules each tick against an absolute
 * deadline derived from Date.now(), so the displayed time stays accurate even if
 * the event loop is briefly busy or the tab is throttled.
 */
export class CountdownTimer {
  constructor() {
    this.totalSeconds = 0;
    this.remaining = 0;
    this._deadline = 0;
    this._timeoutId = null;
    this.state = 'idle'; // 'idle' | 'running' | 'paused' | 'complete'

    this.onTick = () => {};
    this.onComplete = () => {};
    this.onStateChange = () => {};
  }

  /** Set the duration (in seconds) while idle/stopped. */
  set(totalSeconds) {
    this.totalSeconds = Math.max(0, Math.floor(totalSeconds));
    this.remaining = this.totalSeconds;
    this._setState('idle');
    this.onTick(this.remaining);
  }

  start() {
    if (this.state === 'running') return;
    if (this.remaining <= 0) {
      // Nothing to count down; restart from the configured total if available.
      if (this.totalSeconds <= 0) return;
      this.remaining = this.totalSeconds;
    }
    this._deadline = Date.now() + this.remaining * 1000;
    this._setState('running');
    this._scheduleNext();
  }

  pause() {
    if (this.state !== 'running') return;
    this._clear();
    // Snap remaining to the truthful value based on the deadline.
    this.remaining = Math.max(0, Math.round((this._deadline - Date.now()) / 1000));
    this._setState('paused');
  }

  toggle() {
    if (this.state === 'running') this.pause();
    else this.start();
  }

  reset() {
    this._clear();
    this.remaining = this.totalSeconds;
    this._setState('idle');
    this.onTick(this.remaining);
  }

  _scheduleNext() {
    // Align to the next whole-second boundary relative to the deadline so ticks
    // land cleanly on second changes.
    const msUntilDeadline = this._deadline - Date.now();
    const msIntoCurrentSecond = msUntilDeadline % 1000;
    const delay = msIntoCurrentSecond === 0 ? 1000 : msIntoCurrentSecond;

    this._timeoutId = setTimeout(() => {
      const msLeft = this._deadline - Date.now();
      this.remaining = Math.max(0, Math.round(msLeft / 1000));
      this.onTick(this.remaining);

      if (this.remaining <= 0) {
        this._clear();
        this._setState('complete');
        this.onComplete();
        return;
      }
      this._scheduleNext();
    }, delay);
  }

  _clear() {
    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  _setState(next) {
    if (this.state === next) return;
    this.state = next;
    this.onStateChange(next);
  }
}

/** Convert a count of seconds into zero-padded { hh, mm, ss } strings. */
export function formatParts(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return {
    hh: String(hh).padStart(2, '0'),
    mm: String(mm).padStart(2, '0'),
    ss: String(ss).padStart(2, '0'),
  };
}
