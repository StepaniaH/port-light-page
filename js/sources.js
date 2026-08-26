// Port-Light landing page — source cards expand in place with the real
// mechanics behind each source, and simultaneously focus the merge grid on
// the cells that source contributes. One card open at a time.

export function initSources() {
  const grid = document.querySelector('.merge-grid');
  const cards = [...document.querySelectorAll('.source-card')];
  if (!grid || !cards.length) return;
  let active = null;

  const apply = () => {
    for (const c of cards) {
      const on = c.dataset.source === active;
      c.setAttribute('aria-expanded', String(on));
      c.setAttribute('aria-pressed', String(on));
    }
    if (active) grid.dataset.focus = active;
    else delete grid.dataset.focus;
  };

  for (const card of cards) {
    card.addEventListener('click', () => {
      active = active === card.dataset.source ? null : card.dataset.source;
      apply();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  }
}
