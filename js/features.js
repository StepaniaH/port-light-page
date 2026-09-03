// Port-Light landing page — feature detail view: click a card, the grid fades
// out and the card glides (FLIP) into a left panel; the right panel shows
// title/description plus a micro-demo. The icon rail switches features with a
// crossfade; back button or Esc fades the grid back in. All motion is skipped
// under prefers-reduced-motion.

const EASE = 'cubic-bezier(.22,.8,.26,1)';

export function initFeatures() {
  const grid = document.getElementById('feature-grid');
  const detail = document.getElementById('feature-detail');
  if (!grid || !detail) return;

  const cards = [...grid.querySelectorAll('.feature-card')];
  const fdCard = detail.querySelector('.fd-card');
  const fdBody = detail.querySelector('.fd-body');
  const fdDemo = detail.querySelector('.fd-demo');
  const rail = detail.querySelector('.fd-rail');
  const back = detail.querySelector('.fd-back');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = null;

  for (const card of cards) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'fd-ico';
    b.dataset.feature = card.dataset.feature;
    b.setAttribute('aria-label', card.querySelector('h3').textContent);
    b.replaceChildren(card.querySelector('.ico').cloneNode(true));
    b.addEventListener('click', () => (current === card.dataset.feature ? close() : open(card, false)));
    rail.append(b);
  }

  function render(card) {
    const clone = card.cloneNode(true);
    clone.classList.add('fd-card-inner');
    for (const attr of ['role', 'tabindex', 'aria-expanded', 'data-reveal']) clone.removeAttribute(attr);
    fdCard.replaceChildren(clone);
    fdBody.replaceChildren(card.querySelector('h3').cloneNode(true), card.querySelector('p').cloneNode(true));
    const tpl = document.getElementById('fdemo-' + card.dataset.feature);
    fdDemo.replaceChildren(tpl ? tpl.content.cloneNode(true) : document.createDocumentFragment());
    for (const b of rail.children) b.classList.toggle('active', b.dataset.feature === card.dataset.feature);
  }

  function crossfade(card) {
    render(card);
    if (reduced) return;
    for (const el of [fdCard, fdBody, fdDemo]) {
      el.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 240, easing: 'ease-out' }
      );
    }
  }

  function open(card, fromGrid = true) {
    if (current != null && !fromGrid) {
      current = card.dataset.feature;
      crossfade(card);
      for (const c of cards) c.setAttribute('aria-expanded', String(c.dataset.feature === current));
      return;
    }

    const first = fromGrid && !reduced ? card.getBoundingClientRect() : null;
    const showDetail = () => {
      current = card.dataset.feature;
      render(card);
      grid.hidden = true;
      detail.hidden = false;
      for (const c of cards) c.setAttribute('aria-expanded', String(c.dataset.feature === current));
      if (first) {
        const last = fdCard.getBoundingClientRect();
        fdCard.animate(
          [
            { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${first.width / last.width})`, opacity: .55 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 480, easing: EASE }
        );
        for (const el of [fdBody, fdDemo]) {
          el.animate(
            [{ opacity: 0, transform: 'translateX(18px)' }, { opacity: 1, transform: 'none' }],
            { duration: 460, delay: 120, easing: 'ease-out', fill: 'backwards' }
          );
        }
      }
      back.focus({ preventScroll: true });
    };

    if (fromGrid && !reduced) {
      grid.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-out' }).onfinish = showDetail;
    } else {
      showDetail();
    }
  }

  function close() {
    const showGrid = () => {
      current = null;
      detail.hidden = true;
      grid.hidden = false;
      for (const c of cards) c.setAttribute('aria-expanded', 'false');
      if (!reduced) {
        grid.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
      }
    };
    if (!reduced) {
      detail.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in' }).onfinish = showGrid;
    } else {
      showGrid();
    }
  }

  for (const card of cards) {
    card.addEventListener('click', () => open(card, true));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(card, true);
      }
    });
  }
  back.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current != null && !detail.hidden) close();
  });
  document.addEventListener('pl:lang', () => {
    for (const b of rail.children) {
      const card = cards.find((c) => c.dataset.feature === b.dataset.feature);
      if (card) b.setAttribute('aria-label', card.querySelector('h3').textContent);
    }
    const card = cards.find((c) => c.dataset.feature === current);
    if (card) render(card);
  });
}
