import { applyLang, getLang, LANGS, t } from './i18n.js';
import { initDemoGrid } from './demo-grid.js';
import { initThemes } from './themes.js';
import { initLangMenu } from './lang.js';
import { initStats } from './stats.js';
import { initReveal, initCopyButtons } from './reveal.js';

const urlLang = new URLSearchParams(location.search).get('lang');
applyLang(LANGS.some((l) => l.code === urlLang) ? urlLang : getLang());

initDemoGrid(t);
initThemes(new URLSearchParams(location.search).get('theme'));
initLangMenu();
initStats({ starsFallback: 47, pullsFallback: 4745, versionFallback: 'v0.7.2' });
initReveal();
initCopyButtons();
