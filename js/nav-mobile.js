// Port-Light landing page — mobile section menu (hamburger) under the sticky nav.

export function initNavMobile() {
  const btn = document.getElementById('nav-menu-btn');
  const panel = document.getElementById('nav-mobile');
  if (!btn || !panel) return;

  const close = (refocus = false) => {
    if (panel.hidden) return;
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus();
  };
  const open = () => {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  };

  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(true); });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close();
  });
  matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) close(); });
}
