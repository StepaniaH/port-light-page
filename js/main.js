import { applyLang, getLang, LANGS, t } from './i18n.js';
import { initDemoGrid } from './demo-grid.js';
import { initReveal, initCopyButtons } from './reveal.js';

const urlLang = new URLSearchParams(location.search).get('lang');
applyLang(LANGS.includes(urlLang) ? urlLang : getLang());

initDemoGrid(t);
initReveal();
initCopyButtons();

document.getElementById('nav-lang-btn')?.addEventListener('click', () => {
  applyLang(getLang() === 'en' ? 'zh-CN' : 'en');
});
