// Port-Light landing page — custom language dropdown (same pattern as the theme menu).

import { applyLang, getLang, LANGS } from './i18n.js';

export function initLangMenu() {
  const menu = document.getElementById('lang-menu');
  const btn = document.getElementById('nav-lang-btn');
  if (!menu || !btn) return;

  for (const { code, endonym } of LANGS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.lang = code;
    b.setAttribute('role', 'option');
    b.textContent = endonym;
    b.addEventListener('click', () => {
      applyLang(code);
      close();
    });
    menu.append(b);
  }
  btn.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) close();
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close();
  });

  function close() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  applyLang(getLang());
}
