// Port-Light landing page — custom language dropdown (same pattern as the theme menu).

import { applyLang, getLang, LANGS } from './i18n.js';
import { moveFocus } from './menu-nav.js';

export function initLangMenu() {
  const menu = document.getElementById('lang-menu');
  const btn = document.getElementById('nav-lang-btn');
  if (!menu || !btn) return;

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

  for (const { code, endonym } of LANGS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.lang = code;
    b.setAttribute('role', 'option');
    b.textContent = endonym;
    b.addEventListener('click', () => {
      applyLang(code);
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

  applyLang(getLang());
}
