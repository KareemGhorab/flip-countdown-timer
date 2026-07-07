# Focus Countdown

A minimalist, themeable countdown timer with a flip-clock ("flipping paper") animation and soft, non-distracting per-second ticks. Built to run quietly in the background while you work.

![Focus Countdown](https://img.shields.io/badge/stack-Vanilla%20JS%20%2B%20Vite-646cff)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Arbitrary countdown** — set any time via `HH:MM:SS` inputs (default: 1 hour)
- **Quick presets** — 30m, 1h, 2h, 3h, 4h, 5h, 6h, 7h, 8h
- **Flip-clock animation** — paper-style digit flips; only digits that change actually animate
- **Multiple tick sounds** — 8 synthesized voices (Soft, Wood, Click, Tick, Tap, Blip, Pop, Marimba) plus Silent; preview on selection
- **Soft audio** — per-second tick and a gentle completion chime via the Web Audio API (no audio files)
- **17 dark themes** — Midnight, Slate, Mono, Ocean, Forest, Matrix, Sunset, Gold, Crimson, Rosé, Grape, Dracula, Synthwave, Cyber, Nord, Sepia, Coffee
- **Auto-hiding controls** — UI fades away while the timer runs; reappears on mouse move
- **Accessibility** — respects `prefers-reduced-motion` (disables flip animation)
- **Fullscreen** — toggle for distraction-free focus
- **Persistence** — theme, tick sound, volume, mute preference, and active countdown state saved in `localStorage` (survives refresh and sleep)

## Getting started

**Requirements:** Node.js 18+ and npm

```bash
git clone https://github.com/KareemGhorab/flip-countdown-timer.git
cd flip-countdown-timer
npm install
npm run dev
```

Open the URL printed in the terminal (typically `http://localhost:5173/`).

## Build for production

```bash
npm run build      # output in dist/
npm run preview    # serve the production build locally
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

## Usage

1. Set a duration with the time inputs or tap a preset chip.
2. Click **Start** (or press `Space`) to begin the countdown.
3. Pick a theme from the color swatches in the bottom bar.
4. Choose a tick sound from the dropdown; it plays a preview when changed.
5. Adjust volume or mute with the slider and music-note button.
6. Controls auto-hide after a few seconds while running — move the mouse to bring them back.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start / pause |
| `R` | Reset |
| `M` | Mute / unmute |
| `F` | Toggle fullscreen |

## Project structure

| File | Purpose |
|------|---------|
| `index.html` | App shell and control markup |
| `src/main.js` | Wires UI, timer, audio, and themes |
| `src/timer.js` | Drift-corrected countdown engine (`Date.now()`-based scheduling) |
| `src/flipClock.js` | Flip-clock digit renderer and CSS flip animation |
| `src/audio.js` | Web Audio tick voices and completion chime |
| `src/themes.js` | Dark theme definitions (CSS custom properties) |
| `src/persistence.js` | Saves/restores countdown state across refresh and sleep |
| `src/style.css` | Layout, flip-card styling, responsive design |

## Tech stack

- [Vite](https://vitejs.dev/) — dev server and production bundler
- Vanilla JavaScript — no framework dependencies
- CSS custom properties — theming without a preprocessor
- Web Audio API — synthesized sounds, no asset files

## License

MIT
