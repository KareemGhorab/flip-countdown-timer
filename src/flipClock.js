/**
 * Flip-clock ("flipping paper") renderer.
 *
 * Each digit is a card split into a static top half and bottom half. When the
 * value changes, two folding "leaves" animate a rotateX fold so the card looks
 * like a piece of paper flipping over. Only digits whose value actually changed
 * are animated, so seconds flip every tick while hours stay still.
 */

const FLIP_MS = 260; // duration of each half of the fold (top, then bottom)

class FlipDigit {
  constructor() {
    this.value = '';
    this._timeoutId = null;

    const el = document.createElement('div');
    el.className = 'flip';

    this.staticTop = makeHalf('flip__top');
    this.staticBottom = makeHalf('flip__bottom');
    this.leafTop = makeHalf('flip__leaf flip__leaf--top');
    this.leafBottom = makeHalf('flip__leaf flip__leaf--bottom');

    el.append(this.staticTop, this.staticBottom, this.leafTop, this.leafBottom);
    this.el = el;
  }

  _reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  setText(node, text) {
    node.firstChild.textContent = text;
  }

  /** Update the displayed digit. Animates the fold unless animate is false. */
  update(next, animate = true) {
    next = String(next);
    if (next === this.value) return;
    const prev = this.value || next;
    this.value = next;

    if (!animate || this._reducedMotion()) {
      this.setText(this.staticTop, next);
      this.setText(this.staticBottom, next);
      return;
    }

    // Reveal the new value on the static top (hidden behind the folding leaf),
    // keep the old value on the static bottom until the fold completes.
    this.setText(this.staticTop, next);
    this.setText(this.staticBottom, prev);
    this.setText(this.leafTop, prev);
    this.setText(this.leafBottom, next);

    this.el.classList.remove('flipping');
    // Force reflow so re-adding the class restarts the CSS animations.
    void this.el.offsetWidth;
    this.el.classList.add('flipping');

    const finalize = () => {
      this.setText(this.staticBottom, next);
      this.el.classList.remove('flipping');
      this.leafBottom.removeEventListener('animationend', finalize);
      if (this._timeoutId) {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
      }
    };

    this.leafBottom.addEventListener('animationend', finalize);
    // Safety net in case animationend doesn't fire (e.g. tab backgrounded).
    this._timeoutId = setTimeout(finalize, FLIP_MS * 2 + 120);
  }
}

function makeHalf(className) {
  const half = document.createElement('div');
  half.className = className;
  const span = document.createElement('span');
  span.textContent = '';
  half.appendChild(span);
  return half;
}

export class FlipClock {
  /** @param {HTMLElement} root */
  constructor(root) {
    this.root = root;
    this.root.innerHTML = '';
    this.digits = {};

    const groups = [
      ['hh', 'h0', 'h1'],
      ['mm', 'm0', 'm1'],
      ['ss', 's0', 's1'],
    ];

    groups.forEach((group, index) => {
      const [, a, b] = group;
      const groupEl = document.createElement('div');
      groupEl.className = 'flip-group';

      this.digits[a] = new FlipDigit();
      this.digits[b] = new FlipDigit();
      groupEl.append(this.digits[a].el, this.digits[b].el);
      this.root.appendChild(groupEl);

      if (index < groups.length - 1) {
        const sep = document.createElement('div');
        sep.className = 'flip-sep';
        sep.innerHTML = '<span></span><span></span>';
        this.root.appendChild(sep);
      }
    });
  }

  /**
   * @param {{hh:string, mm:string, ss:string}} parts
   * @param {{animate?: boolean}} [opts]
   */
  update(parts, opts = {}) {
    const animate = opts.animate !== false;
    this.digits.h0.update(parts.hh[0], animate);
    this.digits.h1.update(parts.hh[1], animate);
    this.digits.m0.update(parts.mm[0], animate);
    this.digits.m1.update(parts.mm[1], animate);
    this.digits.s0.update(parts.ss[0], animate);
    this.digits.s1.update(parts.ss[1], animate);
  }
}
