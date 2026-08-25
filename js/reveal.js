// Port-Light landing page — scroll-reveal + code copy buttons.

export function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const el of els) el.classList.add('in');
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  for (const el of els) io.observe(el);
}

export function initCopyButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy], .copy-btn');
    if (!btn) return;
    const payload = btn.dataset.copy ?? stripBtnLabel(btn.closest('pre'));
    if (payload == null) return;
    navigator.clipboard?.writeText(payload).catch(() => {});
    const original = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = original; }, 1200);
  });
}

function stripBtnLabel(pre) {
  if (!pre) return null;
  const clone = pre.cloneNode(true);
  for (const b of clone.querySelectorAll('.copy-btn')) b.remove();
  return clone.textContent.trim();
}
