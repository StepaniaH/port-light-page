import { applyLang, getLang, LANGS, t } from './i18n.js';
import { initDemoGrid } from './demo-grid.js';
import { initThemes } from './themes.js';
import { initStats } from './stats.js';
import { initReveal, initCopyButtons } from './reveal.js';

const urlLang = new URLSearchParams(location.search).get('lang');
applyLang(LANGS.includes(urlLang) ? urlLang : getLang());

initDemoGrid(t);
initThemes(new URLSearchParams(location.search).get('theme'));
initStats({ starsFallback: 47, pullsFallback: 4519 });
initReveal();
initCopyButtons();

document.getElementById('nav-lang-btn')?.addEventListener('click', () => {
  applyLang(getLang() === 'en' ? 'zh-CN' : 'en');
});
