// Port-Light landing page — live GitHub stars + Docker Hub pulls + release
// version, all via /api/stats (a Pages Function proxying Docker Hub — which
// sends no CORS headers — and the GitHub API, edge-cached so visitors never
// hit upstream rate limits). The baked values in index.html are the offline
// fallbacks; the baked version doubles as the single source for releases.

const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${n}`);

export function initStats({ starsFallback = 47, pullsFallback = 4745 } = {}) {
  const stars = document.getElementById('stat-stars');
  const pulls = document.getElementById('stat-pulls');
  if (!stars || !pulls) return;
  stars.textContent = fmtK(starsFallback);
  stars.dataset.value = String(starsFallback);
  pulls.textContent = fmtK(pullsFallback);
  pulls.dataset.value = String(pullsFallback);

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

  fetch('/api/stats')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => {
      if (typeof d.stars === 'number') countUp(stars, d.stars);
      if (typeof d.pulls === 'number') countUp(pulls, d.pulls);
      if (typeof d.version === 'string' && /^v\d+\.\d+\.\d+/.test(d.version)) {
        for (const el of document.querySelectorAll('[data-app-version]')) el.textContent = d.version;
        // Keep the structured data consistent with the live release, even
        // though crawlers that don't run JS only ever see the baked value.
        const ld = document.querySelector('script[type="application/ld+json"]');
        if (ld) {
          try {
            const data = JSON.parse(ld.textContent);
            if (data.softwareVersion !== d.version) {
              data.softwareVersion = d.version;
              ld.textContent = JSON.stringify(data, null, 2);
            }
          } catch { /* malformed JSON-LD: leave the baked value */ }
        }
      }
    })
    .catch(() => {});
}
