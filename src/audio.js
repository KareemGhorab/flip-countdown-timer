/**
 * Soft tick + completion chime synthesized with the Web Audio API.
 *
 * No audio files are bundled. Several tick "voices" are synthesized on the fly
 * so the user can pick the texture they like; each is kept short and gentle so
 * it reads as a quiet tick rather than a distracting beep. Browsers require a
 * user gesture before audio can play, so the context is created lazily and
 * resumed on the first interaction.
 */

export const TICKS = [
  { id: 'soft', name: 'Soft' },
  { id: 'wood', name: 'Wood' },
  { id: 'click', name: 'Click' },
  { id: 'tick', name: 'Tick' },
  { id: 'tap', name: 'Tap' },
  { id: 'blip', name: 'Blip' },
  { id: 'pop', name: 'Pop' },
  { id: 'marimba', name: 'Marimba' },
  { id: 'none', name: 'Silent' },
];

const DEFAULT_TICK = 'soft';

export class TickAudio {
  constructor({ volume = 0.35, muted = false, tick = DEFAULT_TICK } = {}) {
    this.ctx = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.volume = clamp01(volume);
    this.muted = muted;
    this.tickId = TICKS.some((t) => t.id === tick) ? tick : DEFAULT_TICK;
  }

  /** Create/resume the AudioContext. Call from within a user gesture. */
  resume() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._effectiveGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(v) {
    this.volume = clamp01(v);
    if (this.masterGain) this.masterGain.gain.value = this._effectiveGain();
  }

  setMuted(muted) {
    this.muted = !!muted;
    if (this.masterGain) this.masterGain.gain.value = this._effectiveGain();
  }

  setTick(id) {
    if (TICKS.some((t) => t.id === id)) this.tickId = id;
  }

  _effectiveGain() {
    // Keep the ceiling low so even at max it stays unobtrusive.
    return this.muted ? 0 : this.volume * 0.5;
  }

  /** Play the currently selected tick voice. */
  playTick() {
    if (this.muted || !this.ctx || this.tickId === 'none') return;
    const now = this.ctx.currentTime;
    const voice = this._voices[this.tickId] || this._voices[DEFAULT_TICK];
    voice.call(this, now);
  }

  /** A gentle three-note chime when the countdown reaches zero. */
  playComplete() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [
      { freq: 660, at: 0 },
      { freq: 880, at: 0.18 },
      { freq: 1320, at: 0.36 },
    ];

    for (const { freq, at } of notes) {
      const start = now + at;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.9, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.55);
    }
  }

  // ---- internals ----

  _tone(now, { type = 'sine', from, to = from, attack = 0.004, decay = 0.06, peak = 1 }) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, now + decay);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + decay + 0.02);
  }

  _noise(now, { duration = 0.03, type = 'highpass', frequency = 3000, q = 0.7, peak = 0.7 }) {
    if (!this.noiseBuffer) {
      const len = Math.floor(this.ctx.sampleRate * 0.2);
      const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buffer;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  get _voices() {
    return {
      // Gentle sine "tock" with a slight downward pitch bend.
      soft: (now) => this._tone(now, { type: 'sine', from: 1350, to: 900, decay: 0.06 }),
      // Hollow wooden knock.
      wood: (now) => this._tone(now, { type: 'triangle', from: 1100, to: 640, decay: 0.05, peak: 0.9 }),
      // Crisp filtered-noise click.
      click: (now) => this._noise(now, { duration: 0.025, type: 'highpass', frequency: 3500, peak: 0.5 }),
      // Bright, very short mechanical tick.
      tick: (now) => this._tone(now, { type: 'sine', from: 2100, to: 1700, attack: 0.002, decay: 0.03, peak: 0.8 }),
      // Mellow low tap.
      tap: (now) => this._tone(now, { type: 'sine', from: 430, to: 360, decay: 0.07, peak: 0.9 }),
      // Small digital square blip.
      blip: (now) => this._tone(now, { type: 'square', from: 880, to: 880, attack: 0.003, decay: 0.04, peak: 0.4 }),
      // Rubbery pop that pitches up then settles.
      pop: (now) => this._tone(now, { type: 'sine', from: 600, to: 1200, attack: 0.004, decay: 0.05, peak: 0.8 }),
      // Soft, slightly resonant musical note.
      marimba: (now) => this._tone(now, { type: 'sine', from: 1046, to: 1046, attack: 0.004, decay: 0.18, peak: 0.7 }),
    };
  }
}

function clamp01(v) {
  v = Number(v);
  if (Number.isNaN(v)) return 0;
  return Math.min(1, Math.max(0, v));
}
