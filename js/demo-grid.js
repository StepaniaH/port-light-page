// Port-Light landing page — simulated occupancy grid for the hero demo.

export const PORTS = [
  { port: 22, name: 'sshd', status: 'used' },
  { port: 53, name: 'adguardhome', status: 'used' },
  { port: 80, name: 'caddy', status: 'used' },
  { port: 111, name: 'rpcbind', status: 'used' },
  { port: 443, name: 'caddy', status: 'used' },
  { port: 1900, name: 'plex', status: 'used' },
  { port: 3000, name: 'grafana', status: 'used' },
  { port: 3001, name: 'uptime-kuma', status: 'used' },
  { port: 3002, name: 'jellystat', status: 'used' },
  { port: 3003, name: 'logto', status: 'used' },
  { port: 3004, name: 'logto', status: 'used' },
  { port: 3020, name: 'gitea', status: 'used' },
  { port: 3030, name: 'homepage', status: 'used' },
  { port: 3210, name: 'lobe-server', status: 'used' },
  { port: 3306, name: 'mysql', status: 'configured' },
  { port: 4533, name: 'navidrome', status: 'used' },
  { port: 5003, name: 'dify-plugin', status: 'used' },
  { port: 5230, name: 'memos', status: 'used' },
  { port: 5432, name: 'postgres', status: 'configured' },
  { port: 5800, name: 'makemkv', status: 'used' },
  { port: 6379, name: 'redis', status: 'configured' },
  { port: 6767, name: 'bazarr', status: 'used' },
  { port: 6881, name: 'qbittorrent', status: 'used' },
  { port: 6969, name: 'whisparr', status: 'used' },
  { port: 7878, name: 'radarr', status: 'used' },
  { port: 8015, name: 'mcp-fs-web2org', status: 'used' },
  { port: 8080, name: 'qbittorrent', status: 'used' },
  { port: 8081, name: 'adguardhome', status: 'used' },
  { port: 8082, name: 'calibre-web', status: 'used' },
  { port: 8083, name: 'freshrss', status: 'used' },
  { port: 8096, name: 'jellyfin', status: 'used' },
  { port: 8111, name: 'dify-nginx', status: 'used' },
  { port: 8123, name: 'python3', status: 'used' },
  { port: 8384, name: 'syncthing', status: 'used' },
  { port: 8412, name: 'gatus', status: 'used' },
  { port: 8443, name: 'dify-nginx', status: 'used' },
  { port: 8888, name: 'my_ml_notebook', status: 'configured' },
  { port: 8920, name: 'emby', status: 'configured' },
  { port: 8989, name: 'sonarr', status: 'used' },
  { port: 9000, name: 'portainer', status: 'used' },
  { port: 9001, name: 'lobe-minio', status: 'used' },
  { port: 9080, name: 'health-export', status: 'used' },
  { port: 9090, name: 'prometheus', status: 'used' },
  { port: 9100, name: 'node-exporter', status: 'used' },
  { port: 9208, name: 'mdc', status: 'used' },
  { port: 9443, name: 'portainer', status: 'used' },
];

const BEAM_PERIOD_MS = 12000;
const USER_IDLE_MS = 12000;
const TICK_MS = 7000;

export function initDemoGrid(t = (key, params) => fallbackStr(key, params)) {
  const grid = document.getElementById('demo-grid');
  if (!grid) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = new Map(PORTS.map((p) => [p.port, { ...p }]));
  let userActiveUntil = 0;
  let demoInView = true;

  const countsEl = document.getElementById('demo-counts');
  const search = document.getElementById('demo-search');
  const toastEl = document.getElementById('demo-toast');
  let toastTimer = 0;

  function toast(msg) {
    if (!toastEl || !msg) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
  }

  function updateCounts() {
    if (!countsEl) return;
    const used = [...state.values()].filter((r) => r.status === 'used').length;
    const configured = [...state.values()].filter((r) => r.status === 'configured').length;
    countsEl.textContent = t('demo.counts', { u: used, c: configured });
  }

  function suggestionsAround(port, n = 3) {
    const taken = new Set(state.keys());
    const out = [];
    for (let d = 1; out.length < n && d < 40; d++) {
      for (const cand of [port + d, port - d]) {
        if (cand > 0 && cand < 65536 && !taken.has(cand) && !out.includes(cand)) out.push(cand);
        if (out.length >= n) break;
      }
    }
    return out;
  }

  function cellEl({ port, name, cls }) {
    const b = document.createElement('button');
    b.className = `cell ${cls}`;
    b.dataset.port = port;
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = port;
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = name;
    b.append(num, lbl);
    return b;
  }

  function render(filter = '') {
    grid.textContent = '';
    const q = filter.replace(/[^0-9]/g, '');
    for (const row of state.values()) {
      if (q && !String(row.port).includes(q) && !row.name.includes(filter)) continue;
      grid.append(cellEl({ port: row.port, name: row.name, cls: row.status }));
    }
    if (q) {
      for (const cell of grid.children) {
        if (cell.dataset.port === q) cell.classList.add('hit');
      }
      if (!state.has(Number(q))) {
        grid.append(cellEl({ port: Number(q), name: t('demo.free'), cls: 'free' }));
      }
      for (const p of suggestionsAround(Number(q))) {
        grid.append(cellEl({ port: p, name: t('demo.free'), cls: 'free' }));
      }
    }
  }

  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell || cell.classList.contains('free')) return;
    userActiveUntil = Date.now() + USER_IDLE_MS;
    navigator.clipboard?.writeText(cell.dataset.port).catch(() => {});
    toast(t('demo.toast.copied', { port: cell.dataset.port }));
  });

  search?.addEventListener('input', () => {
    userActiveUntil = Date.now() + USER_IDLE_MS;
    render(search.value.trim());
  });
  search?.addEventListener('focus', () => { userActiveUntil = Date.now() + USER_IDLE_MS; });

  const initialQuery = (new URLSearchParams(location.search).get('q') ?? '').replace(/[^0-9]/g, '').slice(0, 5);
  if (initialQuery && search) {
    search.value = initialQuery;
    userActiveUntil = Date.now() + USER_IDLE_MS;
  }

  updateCounts();
  render(initialQuery);

  if (reduced) return;

  // --- story loop ---------------------------------------------------------
  function flipToUsed() {
    const configured = [...state.values()].filter((r) => r.status === 'configured');
    if (!configured.length) return;
    const row = configured[Math.floor(Math.random() * configured.length)];
    row.status = 'used';
    render(search?.value.trim() || '');
    updateCounts();
    for (const cell of grid.children) {
      if (cell.dataset.port === String(row.port)) cell.classList.add('flash');
    }
    toast(t('demo.toast.listener', { name: row.name, port: row.port }));
  }

  function conflictPulse() {
    const used = [...state.values()].filter((r) => r.status === 'used');
    if (used.length < 2) return;
    const a = used[Math.floor(Math.random() * used.length)];
    let b = used[Math.floor(Math.random() * used.length)];
    if (a === b) b = used.find((r) => r !== a) || a;
    for (const cell of grid.children) {
      if (cell.dataset.port === String(a.port) || cell.dataset.port === String(b.port)) {
        cell.classList.add('conflict');
      }
    }
    toast(t('demo.toast.conflict', { port: a.port }));
  }

  function searchDemo() {
    if (!search) return;
    const query = '3000';
    let i = 0;
    const type = () => {
      if (Date.now() < userActiveUntil) { search.value = ''; render(''); return; }
      search.value = query.slice(0, ++i);
      render(search.value);
      if (i < query.length) {
        setTimeout(type, 110);
      } else {
        toast(t('demo.toast.free', { port: 3000, n: 3 }));
        setTimeout(() => {
          if (Date.now() < userActiveUntil) return;
          search.value = '';
          render('');
        }, 4000);
      }
    };
    type();
  }

  const scenarios = [flipToUsed, conflictPulse, searchDemo];
  let idx = 0;
  new IntersectionObserver(([e]) => { demoInView = e.isIntersecting; }, { threshold: 0.3 }).observe(grid);
  setTimeout(function tick() {
    if (Date.now() > userActiveUntil && demoInView && document.visibilityState === 'visible') {
      try { scenarios[idx++ % scenarios.length](); } catch { /* keep the loop alive */ }
    }
    setTimeout(tick, TICK_MS);
  }, 3500);

  // --- lighthouse beam ------------------------------------------------------
  // Rotation itself is pure CSS (12s linear). JS only lights cards as the
  // beam passes, at low frequency, with a read-then-write pass to avoid
  // layout thrash.
  const panel = grid.closest('.demo-panel');
  const BEAM_OFFSET = 3000;
  function lightBeam() {
    if (!demoInView || document.visibilityState !== 'visible') return;
    const a = (((performance.now() + BEAM_OFFSET) % BEAM_PERIOD_MS) / BEAM_PERIOD_MS) * 360;
    const pr = panel.getBoundingClientRect();
    const cells = [...grid.children];
    const rects = cells.map((c) => c.getBoundingClientRect());
    const pcx = pr.left + pr.width / 2;
    const pcy = pr.top + pr.height / 2;
    cells.forEach((cell, i) => {
      const cx = rects[i].left + rects[i].width / 2 - pcx;
      const cy = rects[i].top + rects[i].height / 2 - pcy;
      const card = (Math.atan2(cy, cx) * 180) / Math.PI + 90;
      const d = Math.abs(((card - a + 540) % 360) - 180);
      cell.classList.toggle('lit', d > 168);
    });
  }
  setInterval(lightBeam, 150);
}

function fallbackStr(key, params = {}) {
  const en = {
    'demo.counts': '{u} in use · {c} configured',
    'demo.free': 'free',
    'demo.toast.listener': '{name} is now listening on {port}',
    'demo.toast.conflict': 'Conflict: two stacks claim port {port}',
    'demo.toast.free': '{port} is taken — {n} free ports nearby',
    'demo.toast.copied': 'Copied {port}',
  };
  let s = en[key] ?? key;
  for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
