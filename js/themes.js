// Port-Light landing page — theme switcher (15 palettes) + gallery.
// Display names come from the locale files under theme.* so the menu and
// gallery follow the UI language.

import { t } from './i18n.js';
import { moveFocus } from './menu-nav.js';

export const THEMES = [
  'dark', 'light', 'gruvbox', 'gruvbox-light', 'catppuccin', 'catppuccin-latte',
  'nord', 'dracula', 'tokyo-night', 'one-dark', 'solarized', 'solarized-light',
  'everforest', 'rose-pine', 'kanagawa',
];

const themeLabel = (id) => t(`theme.${id}`) ?? id;

// [bg, used, configured, free] — mirrors css/tokens.css
const SWATCH = {
  dark: ['#0c1016', '#58a6ff', '#d4a017', '#3fb950'],
  light: ['#f3f5f7', '#0969da', '#9a6700', '#1a7f37'],
  gruvbox: ['#282828', '#83a598', '#d79921', '#b8bb26'],
  'gruvbox-light': ['#fbf1c7', '#076678', '#b57614', '#79740e'],
  catppuccin: ['#1e1e2e', '#89b4fa', '#f9e2af', '#a6e3a1'],
  'catppuccin-latte': ['#eff1f5', '#1e66f5', '#df8e1d', '#40a02b'],
  nord: ['#2e3440', '#88c0d0', '#ebcb8b', '#a3be8c'],
  dracula: ['#282a36', '#8be9fd', '#f1fa8c', '#50fa7b'],
  'tokyo-night': ['#1a1b26', '#7aa2f7', '#e0af68', '#9ece6a'],
  'one-dark': ['#282c34', '#61afef', '#e5c07b', '#98c379'],
  solarized: ['#002b36', '#268bd2', '#b58900', '#859900'],
  'solarized-light': ['#fdf6e3', '#268bd2', '#b58900', '#859900'],
  everforest: ['#2d353b', '#7fbbb3', '#dbbc7f', '#a7c080'],
  'rose-pine': ['#191724', '#9ccfd8', '#f6c177', '#31748f'],
  kanagawa: ['#1f1f28', '#7e9cd8', '#e6c384', '#98bb6c'],
};

export function getTheme() {
  return document.documentElement.dataset.theme || 'dark';
}

export function applyTheme(id) {
  if (!THEMES.includes(id)) id = 'dark';
  document.documentElement.dataset.theme = id;
  try { localStorage.setItem('pl-theme', id); } catch { /* private mode */ }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && SWATCH[id]) meta.setAttribute('content', SWATCH[id][0]);
  for (const card of document.querySelectorAll('[data-theme-card]')) {
    card.classList.toggle('active', card.dataset.themeCard === id);
  }
  for (const btn of document.querySelectorAll('#theme-menu button')) {
    const active = btn.dataset.themeId === id;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  }
}

export function initThemes(urlTheme = null) {
  let saved = 'dark';
  try { saved = localStorage.getItem('pl-theme') ?? 'dark'; } catch { /* private mode */ }
  if (THEMES.includes(urlTheme)) saved = urlTheme;
  applyTheme(saved);

  const menu = document.getElementById('theme-menu');
  const btn = document.getElementById('nav-theme-btn');
  if (menu && btn) {
    const close = (refocus = false) => {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (refocus) btn.focus();
    };
    const open = () => {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      (menu.querySelector('button.active') ?? menu.querySelector('button'))?.focus();
    };
    for (const id of THEMES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.themeId = id;
      b.textContent = themeLabel(id);
      b.classList.toggle('active', id === saved);
      b.setAttribute('aria-selected', String(id === saved));
      b.addEventListener('click', () => {
        applyTheme(id);
        close(true);
      });
      menu.append(b);
    }
    btn.addEventListener('click', () => (menu.hidden ? open() : close()));
    menu.addEventListener('keydown', (e) => moveFocus(e, menu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) close(true);
    });
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close();
    });
  }

  const gallery = document.getElementById('theme-gallery');
  if (gallery) {
    for (const id of THEMES) {
      const [bg, used, configured, free] = SWATCH[id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'theme-card' + (id === saved ? ' active' : '');
      card.dataset.themeCard = id;
      card.setAttribute('aria-label', themeLabel(id));
      const swatches = document.createElement('span');
      swatches.className = 'swatches';
      for (const c of [bg, used, configured, free]) {
        const i = document.createElement('i');
        i.style.background = c;
        swatches.append(i);
      }
      const name = document.createElement('span');
      name.className = 'tname';
      name.textContent = themeLabel(id);
      card.append(swatches, name);
      card.addEventListener('click', () => applyTheme(id));
      gallery.append(card);
    }
  }

  document.addEventListener('pl:lang', () => {
    for (const b of menu?.querySelectorAll('button') ?? []) {
      b.textContent = themeLabel(b.dataset.themeId);
    }
    for (const c of gallery?.querySelectorAll('.theme-card') ?? []) {
      c.setAttribute('aria-label', themeLabel(c.dataset.themeCard));
      const n = c.querySelector('.tname');
      if (n) n.textContent = themeLabel(c.dataset.themeCard);
    }
  });
}
