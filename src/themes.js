/**
 * Color themes expressed as sets of CSS custom properties.
 *
 * Applying a theme just writes the variables onto :root; every visual surface in
 * style.css reads from these, so adding a new theme is purely a data change.
 */

const STORAGE_KEY = 'fct.theme';

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight',
    vars: {
      '--bg': '#0e1116',
      '--bg-alt': '#161b22',
      '--card': '#1c2230',
      '--card-shade': '#161b27',
      '--digit': '#f2f5fb',
      '--accent': '#6ea8fe',
      '--text': '#aab3c5',
      '--muted': '#5b6577',
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    vars: {
      '--bg': '#0f141a',
      '--bg-alt': '#161d26',
      '--card': '#1e2732',
      '--card-shade': '#161d26',
      '--digit': '#eef3f8',
      '--accent': '#7c93ad',
      '--text': '#9aa7b6',
      '--muted': '#51606f',
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    vars: {
      '--bg': '#101010',
      '--bg-alt': '#171717',
      '--card': '#1f1f1f',
      '--card-shade': '#181818',
      '--digit': '#fafafa',
      '--accent': '#bdbdbd',
      '--text': '#9a9a9a',
      '--muted': '#5a5a5a',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    vars: {
      '--bg': '#06141f',
      '--bg-alt': '#0a2233',
      '--card': '#0f2e44',
      '--card-shade': '#0a2233',
      '--digit': '#e3f4ff',
      '--accent': '#38bdf8',
      '--text': '#8fb8cf',
      '--muted': '#3f6a85',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    vars: {
      '--bg': '#0f1a14',
      '--bg-alt': '#15241b',
      '--card': '#1b2e22',
      '--card-shade': '#15241b',
      '--digit': '#eaf5ec',
      '--accent': '#6fcf97',
      '--text': '#9bc0a8',
      '--muted': '#557864',
    },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    vars: {
      '--bg': '#050a06',
      '--bg-alt': '#08120a',
      '--card': '#0c1a0f',
      '--card-shade': '#08120a',
      '--digit': '#c8ffd2',
      '--accent': '#2bd96a',
      '--text': '#6fae80',
      '--muted': '#2f5a3c',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    vars: {
      '--bg': '#1f1115',
      '--bg-alt': '#2d1820',
      '--card': '#3a2029',
      '--card-shade': '#2d1820',
      '--digit': '#ffe9df',
      '--accent': '#ff7a59',
      '--text': '#d3a99b',
      '--muted': '#7d5048',
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    vars: {
      '--bg': '#14110a',
      '--bg-alt': '#1f1a10',
      '--card': '#2a2416',
      '--card-shade': '#1f1a10',
      '--digit': '#fbf3df',
      '--accent': '#e0b341',
      '--text': '#c4b489',
      '--muted': '#756a47',
    },
  },
  {
    id: 'crimson',
    name: 'Crimson',
    vars: {
      '--bg': '#160d10',
      '--bg-alt': '#24121a',
      '--card': '#2f1820',
      '--card-shade': '#24121a',
      '--digit': '#ffe6ea',
      '--accent': '#ef4565',
      '--text': '#c79aa4',
      '--muted': '#7a4754',
    },
  },
  {
    id: 'rose',
    name: 'Rosé',
    vars: {
      '--bg': '#1a1014',
      '--bg-alt': '#26161d',
      '--card': '#2f1c25',
      '--card-shade': '#26161d',
      '--digit': '#fbe9f0',
      '--accent': '#ec9ab7',
      '--text': '#c9a3b2',
      '--muted': '#7c5566',
    },
  },
  {
    id: 'grape',
    name: 'Grape',
    vars: {
      '--bg': '#150e22',
      '--bg-alt': '#211633',
      '--card': '#2b1e44',
      '--card-shade': '#211633',
      '--digit': '#efe7ff',
      '--accent': '#a06bff',
      '--text': '#b3a3d6',
      '--muted': '#6a5894',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    vars: {
      '--bg': '#21222c',
      '--bg-alt': '#282a36',
      '--card': '#343746',
      '--card-shade': '#282a36',
      '--digit': '#f8f8f2',
      '--accent': '#bd93f9',
      '--text': '#b9bcd0',
      '--muted': '#6272a4',
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    vars: {
      '--bg': '#16121f',
      '--bg-alt': '#1e1830',
      '--card': '#271f3d',
      '--card-shade': '#1e1830',
      '--digit': '#ffe7fb',
      '--accent': '#ff2e97',
      '--text': '#c2a8d6',
      '--muted': '#6b5a8c',
    },
  },
  {
    id: 'cyber',
    name: 'Cyber',
    vars: {
      '--bg': '#060a0c',
      '--bg-alt': '#0b1316',
      '--card': '#0f1c20',
      '--card-shade': '#0b1316',
      '--digit': '#ddfdff',
      '--accent': '#14e0e0',
      '--text': '#7fb5ba',
      '--muted': '#2f5a5f',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    vars: {
      '--bg': '#2e3440',
      '--bg-alt': '#353c4a',
      '--card': '#3b4252',
      '--card-shade': '#343b48',
      '--digit': '#eceff4',
      '--accent': '#88c0d0',
      '--text': '#abb6c8',
      '--muted': '#6b768c',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    vars: {
      '--bg': '#241c16',
      '--bg-alt': '#2e231b',
      '--card': '#3a2c21',
      '--card-shade': '#2f2319',
      '--digit': '#f4e6d2',
      '--accent': '#d9a066',
      '--text': '#c4ab92',
      '--muted': '#7d6750',
    },
  },
  {
    id: 'coffee',
    name: 'Coffee',
    vars: {
      '--bg': '#15100c',
      '--bg-alt': '#1f1813',
      '--card': '#2a201a',
      '--card-shade': '#1f1813',
      '--digit': '#efe2d4',
      '--accent': '#b07d4f',
      '--text': '#b39f8c',
      '--muted': '#6a574a',
    },
  },
];

export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyTheme(id) {
  const theme = getThemeById(id);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  root.dataset.theme = theme.id;
  return theme.id;
}

export function saveTheme(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* storage unavailable (private mode); ignore */
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || THEMES[0].id;
  } catch {
    return THEMES[0].id;
  }
}
