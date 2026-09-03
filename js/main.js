import { applyLang, getLang, LANGS, t } from './i18n.js';
import { initDemoGrid } from './demo-grid.js';
import { initThemes } from './themes.js';
import { initLangMenu } from './lang.js';
import { initNavMobile } from './nav-mobile.js';
import { initStats } from './stats.js';
import { initReveal, initCopyButtons } from './reveal.js';
import { initSources } from './sources.js';
import { initFeatures } from './features.js';

const urlLang = new URLSearchParams(location.search).get('lang');
applyLang(LANGS.some((l) => l.code === urlLang) ? urlLang : getLang());
document.documentElement.classList.remove('lang-pending');

initDemoGrid(t);
initThemes(new URLSearchParams(location.search).get('theme'));
initLangMenu();
initNavMobile();
initStats({ starsFallback: 52, pullsFallback: 8433 });
initReveal();
initCopyButtons();
initSources();
initFeatures();

for (const el of document.querySelectorAll('.agents-exp')) {
  el.textContent = new Date(Date.now() + 36e5).toISOString().replace(/\.\d+Z$/, 'Z');
}

// Link the decorative echo grid to the terminal reservations it illustrates:
// hovering either side highlights both.
for (const cell of document.querySelectorAll('.echo-grid [data-port]')) {
  const line = document.querySelector(`.agents-res[data-port="${cell.dataset.port}"]`);
  if (!line) continue;
  const toggle = (on) => {
    line.classList.toggle('hl', on);
    cell.classList.toggle('linked', on);
  };
  for (const el of [cell, line]) {
    el.addEventListener('mouseenter', () => toggle(true));
    el.addEventListener('mouseleave', () => toggle(false));
  }
}
