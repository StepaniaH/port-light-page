import { applyLang, getLang, LANGS, t } from './i18n.js';
import { initDemoGrid } from './demo-grid.js';
import { initThemes } from './themes.js';
import { initLangMenu } from './lang.js';
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
initStats({ starsFallback: 47, pullsFallback: 4745 });
initReveal();
initCopyButtons();
initSources();
initFeatures();

const agentsExp = document.getElementById('agents-exp');
if (agentsExp) {
  agentsExp.textContent = new Date(Date.now() + 36e5).toISOString().replace(/\.\d+Z$/, 'Z');
}
