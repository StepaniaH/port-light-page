// Port-Light landing page — live GitHub stars / Docker Hub pulls with baked fallbacks.

const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${n}`);

export function initStats({ starsFallback = 47, pullsFallback = 4519 } = {}) {
  const stars = document.getElementById('stat-stars');
  const pulls = document.getElementById('stat-pulls');
  if (!stars || !pulls) return;
  stars.textContent = fmtK(starsFallback);
  pulls.textContent = fmtK(pullsFallback);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const countUp = (el, target) => {
    if (reduced) {
      el.textContent = fmtK(target);
      return;
    }
    const from = Number(el.dataset.value ?? 0);
    el.dataset.value = String(target);
    const t0 = performance.now();
    const dur = 700;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - (1 - p) ** 3;
      el.textContent = fmtK(Math.round(from + (target - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  fetch('https://api.github.com/repos/StepaniaH/port-light')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => { if (typeof d.stargazers_count === 'number') countUp(stars, d.stargazers_count); })
    .catch(() => {});

  fetch('https://hub.docker.com/v2/repositories/stepaniah/port-light')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => { if (typeof d.pull_count === 'number') countUp(pulls, d.pull_count); })
    .catch(() => {});
}
