// Port-Light landing page — i18n engine. Strings live in ./locales/<code>.js;
// adding a language = one locale file + one LANGS entry.

import en from './locales/en.js';
import zhCN from './locales/zh-CN.js';
import zhTW from './locales/zh-TW.js';
import ja from './locales/ja.js';
import fr from './locales/fr.js';
import de from './locales/de.js';
import es from './locales/es.js';

export const LANGS = [
  { code: 'en', endonym: 'English' },
  { code: 'zh-CN', endonym: '简体中文' },
  { code: 'zh-TW', endonym: '繁體中文' },
  { code: 'ja', endonym: '日本語' },
  { code: 'fr', endonym: 'Français' },
  { code: 'de', endonym: 'Deutsch' },
  { code: 'es', endonym: 'Español' },
];

export const DICTS = { en, 'zh-CN': zhCN, 'zh-TW': zhTW, ja, fr, de, es };

export const DEMO_KEYS = [
  'demo.counts', 'demo.free', 'demo.search',
  'demo.toast.listener', 'demo.toast.conflict', 'demo.toast.free', 'demo.toast.copied',
];

export function getLang() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('pl-lang') : null;
  if (LANGS.some((l) => l.code === saved)) return saved;
  const nav = typeof navigator !== 'undefined' && Array.isArray(navigator.languages) ? navigator.languages : [];
  for (const n of nav) {
    if (LANGS.some((l) => l.code === n)) return n;
  }
  for (const n of nav) {
    if (/^zh/i.test(n)) return 'zh-CN';
  }
  return 'en';
}

export function t(key, params = {}, lang = getLang()) {
  let s = (DICTS[lang] ?? DICTS.en)[key] ?? DICTS.en[key];
  if (s == null) return undefined;
  for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function applyLang(lang) {
  if (!LANGS.some((l) => l.code === lang)) lang = 'en';
  if (typeof localStorage !== 'undefined') localStorage.setItem('pl-lang', lang);
  document.documentElement.lang = lang;
  const btn = document.getElementById('nav-lang-btn');
  if (btn) {
    const meta = LANGS.find((l) => l.code === lang);
    btn.textContent = meta ? meta.endonym : 'English';
  }
  for (const b of document.querySelectorAll('#lang-menu button')) {
    b.classList.toggle('active', b.dataset.lang === lang);
  }
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const v = t(el.dataset.i18n, {}, lang);
    if (v != null) el.textContent = v;
  }
  for (const el of document.querySelectorAll('[data-i18n-html]')) {
    const v = t(el.dataset.i18nHtml, {}, lang);
    if (v != null) el.innerHTML = v;
  }
  for (const el of document.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':');
      const v = t(key, {}, lang);
      if (v != null) el.setAttribute(attr, v);
    }
  }
  document.dispatchEvent(new CustomEvent('pl:lang', { detail: { lang } }));
}
