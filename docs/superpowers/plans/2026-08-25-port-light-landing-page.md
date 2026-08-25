# Port-Light Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN default / zh-CN), zero-build static product landing page for Port-Light v0.7.0 with an interactive simulated port-grid hero, brand palette system (15 themes), live GitHub/Docker Hub stats, and scroll animations.

**Architecture:** Single `index.html` + three CSS files (tokens/base/main) + six native ES modules (main, i18n, demo-grid, themes, stats, reveal). No build step, no runtime dependencies except two stats APIs. Content sections are server-independent; JS is progressive enhancement.

**Tech Stack:** Vanilla HTML/CSS/JS (native ES modules), CSS custom properties for theming, IntersectionObserver, `node --test` for module unit tests (no npm), Python http.server for local verification, Cloudflare Pages for hosting.

**Spec:** `docs/superpowers/specs/2026-08-25-port-light-landing-page-design.md`

## Global Constraints

- No build step, no npm, no CDN scripts. Fonts self-hosted woff2.
- English is the default language; `data-i18n` attributes + JS dictionaries; `<html lang>` syncs; localStorage key `pl-lang`.
- Theme = `data-theme` attribute on `<html>`; 15 palettes copied verbatim from `/Users/stepaniah/Developer/passion-projects/port-light/frontend/style.css`; localStorage key `pl-theme`; default `dark`.
- Signal colors are semantic everywhere: used `#58a6ff` (blue), configured `#d4a017` (amber), free `#3fb950` (green).
- All animation gated on `prefers-reduced-motion: no-preference`.
- Demo grid data is clearly labeled simulated; clicking a card copies the port number.
- Product links: GitHub `https://github.com/StepaniaH/port-light`, Docker Hub `https://hub.docker.com/r/stepaniah/port-light`, image `stepaniah/port-light:v0.7.0`.
- Commits: conventional style (`feat:`, `docs:`, `chore:`), one commit per task.
- Sitemap.xml deferred until a custom domain is chosen (robots.txt only).

---

### Task 1: Skeleton — HTML structure, design tokens, base styles, assets

**Files:**
- Create: `index.html`
- Create: `css/tokens.css`
- Create: `css/base.css`
- Create: `css/main.css` (empty section stubs, filled in Task 3)
- Create: `assets/favicon.svg`
- Copy: `assets/icon.png` from `/Users/stepaniah/Developer/passion-projects/port-light/docs/icon.png`
- Create: `assets/fonts/` (Space Grotesk variable woff2, latin subset)

**Interfaces:**
- Produces: full DOM skeleton with stable IDs/classes consumed by all later tasks: `#nav-theme-btn`, `#nav-lang-btn`, `#demo-search`, `#demo-grid`, `#demo-counts`, `#demo-toast`, `#stat-stars`, `#stat-pulls`, `[data-i18n]` keys, `[data-theme-card]`, `[data-reveal]`.
- Produces: token names `--bg --elevated --card --card-hover --border --text --text-dim --used --configured --free --accent --conflict --danger --radius --font-display --font-mono`.

- [ ] **Step 1: Copy icon and fetch fonts**

```bash
cp /Users/stepaniah/Developer/passion-projects/port-light/docs/icon.png assets/icon.png
mkdir -p assets/fonts
# Get the css2 stylesheet with a woff2-capable UA, extract the latin variable-font URL, download it:
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" -o /tmp/sg.css
grep -A2 "latin;" /tmp/sg.css | grep -o "https://[^)]*\.woff2" | head -1
# curl that URL to assets/fonts/space-grotesk-latin.woff2
```

Expected: a `.woff2` file ≥ 15KB exists at `assets/fonts/space-grotesk-latin.woff2`. If Google Fonts is unreachable, fall back to system font stack (delete `--font-display` src usage) and note it in the commit message.

- [ ] **Step 2: Create `assets/favicon.svg`** — minimal lighthouse mark in signal colors:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0c1016"/>
  <g stroke="#58a6ff" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M32 12 L32 20"/>
    <path d="M20 16 L24 22 M44 16 L40 22"/>
  </g>
  <g fill="#e6edf3">
    <path d="M27 24 h10 l3 26 h-16 z"/>
    <rect x="26" y="20" width="12" height="5" rx="2"/>
  </g>
  <circle cx="32" cy="22.5" r="2.4" fill="#d4a017"/>
</svg>
```

- [ ] **Step 3: Create `css/tokens.css`** — font-face + `:root` defaults (dark) + all 15 palettes. Extract palette blocks from the product and adapt:

```bash
awk '/^\[data-theme=/{flag=1} flag{print} /^}$/{if(flag){print ""; flag=0}}' \
  /Users/stepaniah/Developer/passion-projects/port-light/frontend/style.css > /tmp/palettes.css
```

Transform each selector `[data-theme="x"]` → `:root[data-theme="x"]`, drop product-only tokens (`--header-h`, `--drawer-w`, `--overlay`, `--toast-bg`, `--shadow`, `--btn-on-accent`, `--focus`, tag/chip/info color-mix vars), keep: `--bg --elevated --card --card-hover --border --text --text-dim --used --configured --free --accent --conflict --access --hidden --danger --radius --radius-sm`, plus add site tokens per palette: `--beam: var(--used)`, `--glow: color-mix(in srgb, var(--used) 25%, transparent)`. Prepend:

```css
@font-face {
  font-family: "Space Grotesk";
  src: url("../assets/fonts/space-grotesk-latin.woff2") format("woff2");
  font-weight: 300 700;
  font-display: swap;
}
:root {
  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --max-w: 1120px;
}
```

Expected: file contains 16 selector blocks (`:root` + 15 themes). Verify: `grep -c 'data-theme' css/tokens.css` → 15.

- [ ] **Step 4: Create `css/base.css`** — reset, typography, shared components:

```css
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: var(--font-body); line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img, svg { display: block; max-width: 100%; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
.wrap { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }
section { padding: 96px 0; }
h1, h2, h3 { font-family: var(--font-display); line-height: 1.15; margin: 0 0 16px; letter-spacing: -0.02em; }
h1 { font-size: clamp(2.4rem, 5.5vw, 3.8rem); font-weight: 700; }
h2 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 700; }
.kicker { font-family: var(--font-mono); font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
.lead { color: var(--text-dim); font-size: 1.1rem; max-width: 56ch; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius); font-weight: 600; border: 1px solid var(--border); background: var(--card); transition: border-color .2s, background .2s, transform .15s; }
.btn:hover { border-color: var(--accent); transform: translateY(-1px); text-decoration: none; }
.btn.primary { background: var(--accent); color: var(--bg); border-color: transparent; }
.btn.primary:hover { filter: brightness(1.1); }
code, pre { font-family: var(--font-mono); }
pre.codeblock { background: var(--elevated); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; overflow-x: auto; font-size: .85rem; line-height: 1.5; position: relative; }
.copy-btn { position: absolute; top: 10px; right: 10px; padding: 4px 10px; font-size: .75rem; border: 1px solid var(--border); border-radius: 6px; background: var(--card); color: var(--text-dim); }
.copy-btn:hover { color: var(--text); border-color: var(--accent); }
[data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
[data-reveal].in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1; transform: none; transition: none; } }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 5: Create `index.html`** — full semantic structure with final bilingual copy via `data-i18n` (EN text inline as default). Section IDs: `how`, `features`, `agents`, `themes`, `quickstart`. Key structure (all copy final; zh strings live in `js/i18n.js` Task 4):

```html
<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Port-Light — every port, one glance</title>
  <meta name="description" content="A local web dashboard that shows which host ports are taken, as a traffic-light grid. Merges listen tables, Docker and Compose into one honest occupancy map.">
  <meta property="og:title" content="Port-Light — every port, one glance">
  <meta property="og:description" content="Know which port is taken, by what, and which are free. A traffic-light occupancy map for your homelab.">
  <meta property="og:type" content="website">
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <header class="nav">
    <div class="wrap nav-inner">
      <a class="brand" href="#top"><img src="assets/icon.png" alt="" width="28" height="28"><span>Port-Light</span></a>
      <nav class="nav-links" aria-label="Sections">
        <a href="#how" data-i18n="nav.how">How it works</a>
        <a href="#features" data-i18n="nav.features">Features</a>
        <a href="#agents" data-i18n="nav.agents">Agents</a>
        <a href="#quickstart" data-i18n="nav.quickstart">Quick start</a>
      </nav>
      <div class="nav-actions">
        <span class="stat-pill" title="GitHub stars">★ <b id="stat-stars">—</b></span>
        <button id="nav-theme-btn" class="nav-btn" aria-haspopup="listbox" aria-expanded="false" title="Theme">🎨</button>
        <button id="nav-lang-btn" class="nav-btn" title="Language">EN</button>
        <a class="btn" href="https://github.com/StepaniaH/port-light" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
    <div id="theme-menu" class="theme-menu" hidden></div>
  </header>

  <main id="top">
    <section class="hero">
      <div class="wrap hero-inner">
        <div class="hero-copy">
          <p class="kicker" data-i18n="hero.kicker">Port occupancy map for homelabs</p>
          <h1 data-i18n="hero.title">Every port. One glance. Zero guesswork.</h1>
          <p class="lead" data-i18n="hero.sub">Port-Light turns your host's listen tables, Docker, and Compose files into one traffic-light grid — so you always know which port is taken, by what, and which are free.</p>
          <div class="hero-cta">
            <button class="btn primary copy-btn-inline" data-copy="docker pull stepaniah/port-light">docker pull stepaniah/port-light</button>
            <a class="btn" href="https://github.com/StepaniaH/port-light" target="_blank" rel="noopener" data-i18n="hero.github">Star on GitHub</a>
          </div>
          <div class="hero-stats">
            <span class="stat-pill"><b id="stat-pulls">4.4K</b> <span data-i18n="stats.pulls">Docker pulls</span></span>
            <span class="stat-pill">v0.7.0</span>
          </div>
        </div>
        <div class="hero-demo">
          <div class="demo-panel" aria-label="Interactive product demo (simulated data)">
            <div class="demo-head">
              <span class="demo-lighthouse" aria-hidden="true"><img src="assets/icon.png" alt="" width="22" height="22"><i class="beam"></i></span>
              <input id="demo-search" type="text" inputmode="numeric" autocomplete="off" placeholder="Try 3000…" data-i18n-attr="placeholder:demo.search" aria-label="Search ports">
            </div>
            <p id="demo-counts" class="demo-counts" aria-live="off">45 in use · 4 configured</p>
            <div id="demo-grid" class="demo-grid"></div>
            <p class="demo-note" data-i18n="demo.note">live demo · simulated data</p>
          </div>
          <div id="demo-toast" class="demo-toast" hidden></div>
        </div>
      </div>
    </section>

    <section id="how"> … three source cards → grid diagram + legend … </section>
    <section id="features"> … 8 cards … </section>
    <section id="agents"> … terminal block … </section>
    <section id="themes"><div id="theme-gallery" class="theme-gallery"></div></section>
    <section id="quickstart"> … compose codeblock … </section>
    <section class="limits"> … honest positioning … </section>
  </main>
  <footer> … links, PH badge, MIT, Ko-fi … </footer>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

Fill the `…` sections now with final copy (each element carrying `data-i18n` + `data-reveal`):

**#how**: kicker "How it works", h2 "Three local sources. One honest map.", lead "No agents to install, nothing leaves the machine. Port-Light reads what is already true on your host and merges it into a single grid." Three cards (class `source-card`, each with mono title + body):
1. `Host listen tables · /proc, ss` — "TCP/UDP ports actually bound right now."
2. `Docker API` — "Container names, status, images, published mappings."
3. `Compose files` — "Ports that are declared — even when the stack is stopped."
Legend row (class `legend`): `● In use — something is listening` (blue), `● Configured — declared, but quiet` (amber), `● Free — offered when you search` (green).

**#features**: kicker "Features", h2 "Built for people who run too many stacks." Grid of 8 `feature-card`s (icon = emoji, title, body):
1. 🔍 "Search that suggests" — "Type a port number; if it's taken, nearby free ones light up."
2. ⚠️ "Conflict radar" — "Two Compose projects claiming the same host port get flagged before they collide."
3. 🖥️ "Multi-host, one screen" — "Pull occupancy maps from other Port-Light instances over LAN or Tailscale."
4. ⚡ "Live, not stale" — "SSE pushes a refresh the moment occupancy changes; local history records every transition."
5. 🪝 "Hooks & metrics" — "Optional webhooks on new listeners and conflicts; Prometheus aggregates when you want them."
6. 🤖 "Agent-friendly API" — "GET /api/ports/suggest hands your coding agent a genuinely free port — with leases."
7. 🎨 "Speaks your theme" — "Fifteen palettes from Gruvbox to Kanagawa; four UI languages."
8. 🔒 "Stays on your machine" — "No telemetry, no accounts, no cloud. Your port map never leaves the host."

**#agents**: kicker "For coding agents", h2 "Your agent picks ports. They stick." lead "Coding agents guess ports and collide with your stacks. Port-Light exposes a tiny API — and an MCP stdio server — that hands out genuinely free ports, optionally reserving them with an expiring lease." `pre.codeblock` with copy button:

```
curl -s "http://127.0.0.1:2100/api/ports/suggest?count=2&reserve=true&ttl=3600&label=preview"
```

plus response block:

```json
{ "ports": [8081, 8082], "reserved": [8081, 8082], "range": {"start": 1, "end": 9999} }
```

Link row: "MCP server · agent skill · API docs →" pointing to `https://github.com/StepaniaH/port-light/blob/main/docs/integrations.md`.

**#themes**: kicker "Appearance", h2 "Fifteen palettes. Pick yours.", lead "Click one — the whole site re-skins, just like the app." Empty `#theme-gallery` grid (populated by `js/themes.js`).

**#quickstart**: kicker "Quick start", h2 "Up in one minute." `pre.codeblock` with the exact compose YAML from the product README (image `stepaniah/port-light:v0.7.0`, ports 2100:2100, volumes `/compose:ro`, docker.sock ro, `/proc:/host/proc:ro`, `./data:/data`, env `COMPOSE_SCAN_DIR: /compose`) then `docker compose up -d`. Note line: "Images for linux/amd64 and arm64, also on GHCR. Prefer version tags over latest."

**.limits**: h2 "A port occupancy map — not a container manager." body "Port-Light doesn't start or stop containers, tail logs, or replace Portainer. It's a LAN tool: set Basic Auth or keep it behind a reverse proxy, and never expose port 2100." + link to SECURITY.md.

**footer**: brand, links (GitHub · Docker Hub · Docs · Changelog · SECURITY.md), Product Hunt badge image `https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1203037&theme=dark&t=1784992647570` (linked), Ko-fi link `https://ko-fi.com/stepaniah`, "MIT © 2026 StepaniaH · No telemetry."

- [ ] **Step 6: Create `css/main.css` stubs** so the page renders unstyled-but-readable: `.nav` (sticky, `backdrop-filter: blur`, border-bottom), `.hero` (grid 2 cols ≥960px, 1 col below), `.demo-panel` (card look: `var(--card)` bg, border, radius, shadow, padding, `position: relative; overflow: hidden`), `.demo-grid` (`display: grid; grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); gap: 8px`), `.cell` (card: number + label + status dot), `.source-card`, `.feature-card`, `.theme-gallery`, `footer` (border-top, dim). Full polish in Task 3.

- [ ] **Step 7: Create `js/main.js` placeholder** — `import './i18n.js'; console.log('port-light page boot');` (replaced in Task 6).

- [ ] **Step 8: Verify skeleton renders**

```bash
python3 -m http.server 8321
```

Browser open `http://localhost:8321` → snapshot shows nav, hero copy, empty grid, all sections; console has only the boot log. Kill server.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: page skeleton, tokens, base styles, assets"
```

---

### Task 2: Hero demo grid — data, rendering, beam, story loop

**Files:**
- Create: `js/demo-grid.js`
- Create: `js/test/demo-data.test.mjs`
- Modify: `css/main.css` (demo panel styles)
- Modify: `js/main.js` (import + init)

**Interfaces:**
- Consumes: `#demo-grid`, `#demo-search`, `#demo-counts`, `#demo-toast`, `.beam` from index.html.
- Produces: `initDemoGrid()` (idempotent, safe when reduced-motion: renders static grid, no loop). Exported `PORTS` array for tests. Toast text via `t(key, params)` from i18n (Task 4 — until then, English string literals in a local `STR` map that Task 4 replaces).

- [ ] **Step 1: Write failing test `js/test/demo-data.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PORTS } from '../demo-grid.js';

test('demo data: unique ports, valid statuses, enough cards', () => {
  assert.ok(PORTS.length >= 40, `expected >=40 cards, got ${PORTS.length}`);
  const ports = PORTS.map(p => p.port);
  assert.equal(new Set(ports).size, ports.length, 'ports must be unique');
  for (const p of PORTS) {
    assert.ok(Number.isInteger(p.port) && p.port > 0 && p.port < 65536);
    assert.ok(['used', 'configured'].includes(p.status), `bad status ${p.status}`);
    assert.equal(typeof p.name, 'string' && p.name.length > 0, 'name required');
  }
  assert.ok(PORTS.some(p => p.status === 'configured'), 'need amber cards for the story loop');
});
```

- [ ] **Step 2: Run test, expect failure** — `node --test js/test/` → fails: `Cannot find module '../demo-grid.js'`.

- [ ] **Step 3: Implement `js/demo-grid.js`**

Data: ~46 entries mirroring a real homelab (from the product screenshot): 22 sshd/system, 53 adguardhome, 80 caddy, 111 rpcbind/system, 443 caddy, 1900 plex, 3000 grafana, 3001 uptime-kuma, 3002 jellystat, 3003 logto, 3004 logto, 3020 gitea, 3030 homepage, 3210 lobe-server, 3306 mysql/configured, 4533 navidrome, 5003 dify-plugin, 5230 memos, 5432 postgres/configured, 5800 makemkv, 6379 redis/configured, 6767 bazarr, 6881 qbittorrent, 6969 whisparr, 7878 radarr, 8015 mcp-fs-web2org, 8080 qbittorrent, 8081 adguardhome, 8082 calibre-web, 8083 freshrss, 8096 jellyfin, 8111 dify-nginx, 8123 python3, 8384 syncthing, 8412 gatus, 8443 dify-nginx, 8888 my_ml_notebook/configured, 8989 sonarr, 9000 portainer, 9001 lobe-minio, 9080 health-export, 9090 prometheus, 9100 node-exporter, 9208 mdc, 9443 portainer.

Core logic:

```js
export const PORTS = [ /* table above: {port, name, status} */ ];

const STR = { // replaced by i18n in Task 4
  counts: (u, c) => `${u} in use · ${c} configured`,
  listener: (name, port) => `${name} is now listening on ${port}`,
  conflict: (port) => `Conflict: two stacks claim port ${port}`,
  freeHint: (port, n) => `${port} is taken — ${n} free ports nearby`,
};

export function initDemoGrid() {
  const grid = document.getElementById('demo-grid');
  if (!grid) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = new Map(PORTS.map(p => [p.port, { ...p }]));   // port -> live row
  let userActiveUntil = 0;

  const render = (filter = '') => { /* build .cell buttons: used/configured class,
    dot span; when filter: hide non-matching (display:none), mark exact match .hit,
    append up to 3 .cell.free suggestion cards (nearest unused ports) */ };
  render();

  const toast = (msg) => { /* #demo-toast textContent=msg; unhide; clearTimeout;
    hide again after 2600ms */ };
  const counts = () => { /* update #demo-counts from state */ };
  counts();

  // click = copy port (product behavior)
  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell'); if (!cell) return;
    navigator.clipboard?.writeText(cell.dataset.port).catch(() => {});
    toast(STR.listener('', cell.dataset.port) === '' ? '' : `Copied ${cell.dataset.port}`);
  });

  // search: user typing pauses the story loop for 12s
  const search = document.getElementById('demo-search');
  search.addEventListener('input', () => { userActiveUntil = Date.now() + 12000; render(search.value.trim()); });

  if (reduced) return;   // static, honest grid — no loop, no beam JS

  // --- story loop -------------------------------------------------------
  const scenarios = [
    () => { /* new listener: pick a .configured row, flip to used, re-render,
       flash .flash on the cell, toast STR.listener(name, port) */ },
    () => { /* conflict: pick two random used rows, add .conflict 3s, toast STR.conflict(p1) */ },
    () => { /* search demo: type "3000" into #demo-search char-by-char (90ms),
       render('3000') → green suggestions appear, toast STR.freeHint(3000, 3);
       after 4s clear input, render('') */ },
  ];
  let i = 0;
  const tick = () => {
    if (Date.now() > userActiveUntil && document.visibilityState === 'visible'
        && demoInView) scenarios[i++ % scenarios.length]();
    setTimeout(tick, 7000);
  };
  let demoInView = true;
  new IntersectionObserver(([e]) => { demoInView = e.isIntersecting; }, { threshold: .3 })
    .observe(grid);
  setTimeout(tick, 3500);

  // --- lighthouse beam ---------------------------------------------------
  // .beam spins via CSS (12s linear). JS lights cards as the beam passes:
  const beamAngle = (now) => ((now % 12000) / 12000) * 360;
  const panel = grid.closest('.demo-panel');
  const step = (now) => {
    const a = beamAngle(now + 3000);            // offset so beam starts top-left
    for (const cell of grid.children) {
      const r = cell.getBoundingClientRect(), pr = panel.getBoundingClientRect();
      const cx = r.left + r.width / 2 - (pr.left + pr.width / 2);
      const cy = r.top + r.height / 2 - (pr.top + pr.height / 2);
      const card = (Math.atan2(cy, cx) * 180) / Math.PI + 90;  // 0° = up
      const d = Math.abs(((card - a + 540) % 360) - 180);
      cell.classList.toggle('lit', d > 168);    // within ~12° of beam
    }
    requestAnimationFrame(step);
  };
  if (!reduced) requestAnimationFrame(step);
}
```

(Comments here describe behavior; implement them as real code — no stubs ship.)

- [ ] **Step 4: Run test, expect pass** — `node --test js/test/` → 1 passing.

- [ ] **Step 5: Demo styles in `css/main.css`**

```css
.cell { position: relative; display: flex; flex-direction: column; gap: 2px; align-items: flex-start;
  padding: 8px 9px; border-radius: var(--radius-sm); border: 1px solid var(--border);
  background: var(--elevated); font-family: var(--font-mono); text-align: left;
  transition: background .3s, border-color .3s, box-shadow .3s; }
.cell .num { font-size: .95rem; font-weight: 700; }
.cell .lbl { font-size: .62rem; color: var(--text-dim); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell::after { content: ''; position: absolute; right: 7px; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: var(--used); }
.cell.configured::after { background: var(--configured); }
.cell.configured { border-style: dashed; }
.cell.free { border-color: color-mix(in srgb, var(--free) 45%, transparent); background: color-mix(in srgb, var(--free) 8%, transparent); }
.cell.free .lbl { color: var(--free); }
.cell.free::after { background: var(--free); }
.cell.hit { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.cell.lit { background: color-mix(in srgb, var(--used) 14%, var(--elevated)); }
.cell.flash { animation: cellflash 1.2s ease; }
.cell.conflict { animation: cellconflict 1s ease 3; }
@keyframes cellflash { 0% { box-shadow: 0 0 0 3px var(--used); } 100% { box-shadow: none; } }
@keyframes cellconflict { 50% { border-color: var(--conflict); box-shadow: 0 0 0 2px var(--conflict); } }
@media (prefers-reduced-motion: reduce) { .cell.flash, .cell.conflict { animation: none; } }
.demo-lighthouse { position: absolute; top: 10px; left: 12px; width: 24px; height: 24px; }
.beam { position: absolute; left: 12px; top: 12px; width: 640px; height: 640px;
  pointer-events: none; transform-origin: 0 0;
  background: conic-gradient(from 0deg at 0 0, transparent 0deg, var(--glow) 5deg, transparent 12deg);
  animation: beamspin 12s linear infinite; }
@keyframes beamspin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .beam { display: none; } }
.demo-toast { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%);
  background: var(--elevated); border: 1px solid var(--accent); border-radius: 999px;
  padding: 6px 14px; font-size: .78rem; font-family: var(--font-mono); box-shadow: 0 6px 24px rgba(0,0,0,.35); }
```

- [ ] **Step 6: Wire into `js/main.js`** — `import { initDemoGrid } from './demo-grid.js'; initDemoGrid();`

- [ ] **Step 7: Verify in browser** — serve, open, confirm: 46 cards render, counts line correct, typing `3000` filters and shows green suggestions, clicking a card copies + toasts, beam visibly sweeps and lights cards, toast scenarios fire ~every 7s, no console errors. Screenshot hero.

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: interactive demo grid with beam and story loop"`

---

### Task 3: Content sections styling + responsive pass

**Files:**
- Modify: `css/main.css` (complete all section styles)
- Modify: `index.html` (only if a section needs structural fix)

**Interfaces:**
- Consumes: all section markup from Task 1.
- Produces: finished visual design at 1440px and 390px.

- [ ] **Step 1: Style all sections in `css/main.css`**

Key patterns (exact values):

```css
/* nav */
.nav { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
.nav-inner { display: flex; align-items: center; gap: 24px; height: 60px; }
.brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: var(--text); }
.nav-links { display: flex; gap: 20px; margin-left: auto; }
.nav-links a { color: var(--text-dim); font-size: .9rem; }
.nav-links a:hover { color: var(--text); text-decoration: none; }
.nav-actions { display: flex; align-items: center; gap: 10px; margin-left: 8px; }
.nav-btn { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: .72rem; font-family: var(--font-mono); }
.stat-pill { font-family: var(--font-mono); font-size: .75rem; color: var(--text-dim); border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; }
.stat-pill b { color: var(--text); }

/* hero */
.hero { padding: 110px 0 90px; position: relative; overflow: hidden; }
.hero::before { /* harbor-night atmosphere: two radial glows */
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(600px 400px at 85% 10%, color-mix(in srgb, var(--used) 12%, transparent), transparent 70%),
              radial-gradient(500px 380px at 5% 90%, color-mix(in srgb, var(--configured) 7%, transparent), transparent 70%);
}
.hero-inner { position: relative; display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center; }
.hero-cta { display: flex; gap: 12px; flex-wrap: wrap; margin: 28px 0 18px; }
.hero-stats { display: flex; gap: 10px; flex-wrap: wrap; }
.demo-panel { position: relative; overflow: hidden; }
.demo-head { display: flex; align-items: center; gap: 10px; padding: 12px 12px 10px 44px; border-bottom: 1px solid var(--border); }
#demo-search { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; color: var(--text); font-family: var(--font-mono); font-size: .85rem; }
#demo-search:focus { outline: none; border-color: var(--accent); }
.demo-counts { font-family: var(--font-mono); font-size: .72rem; color: var(--text-dim); margin: 10px 12px 6px; }
.demo-grid { padding: 4px 12px 12px; display: grid; grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); gap: 8px; max-height: 430px; overflow-y: auto; }
.demo-note { font-family: var(--font-mono); font-size: .65rem; color: var(--text-dim); text-align: right; padding: 0 14px 10px; margin: 0; }

/* how-it-works */
.sources { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 40px 0; }
.source-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; }
.source-card h3 { font-family: var(--font-mono); font-size: .95rem; margin-bottom: 8px; color: var(--accent); }
.source-card p { margin: 0; color: var(--text-dim); font-size: .92rem; }
.merge-arrow { text-align: center; font-size: 1.6rem; color: var(--text-dim); margin: 8px 0 24px; }
.legend { display: flex; gap: 22px; flex-wrap: wrap; font-family: var(--font-mono); font-size: .8rem; }
.legend .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 7px; }

/* features */
.feature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 40px; }
.feature-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; transition: transform .2s, border-color .2s; }
.feature-card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--accent) 55%, var(--border)); }
.feature-card .ico { font-size: 1.4rem; }
.feature-card h3 { font-size: 1rem; margin: 10px 0 6px; }
.feature-card p { margin: 0; font-size: .88rem; color: var(--text-dim); }

/* agents terminal */
.terminal { background: var(--elevated); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin: 32px 0; }
.terminal-bar { display: flex; gap: 6px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
.terminal-bar i { width: 10px; height: 10px; border-radius: 50%; background: var(--border); }
.terminal pre { margin: 0; padding: 18px; font-size: .85rem; overflow-x: auto; }
.terminal .prompt { color: var(--free); user-select: none; }
.terminal .out { color: var(--text-dim); }

/* themes gallery */
.theme-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; margin-top: 36px; }
.theme-card { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; text-align: left; transition: transform .2s, border-color .2s; }
.theme-card:hover { transform: translateY(-3px); border-color: var(--accent); }
.theme-card.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.theme-card .swatches { display: flex; height: 44px; }
.theme-card .swatches i { flex: 1; }
.theme-card .tname { display: block; padding: 9px 12px; font-family: var(--font-mono); font-size: .72rem; color: var(--text-dim); }

/* quickstart + limits + footer */
.two-col { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: start; }
.limits { background: var(--elevated); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
footer { padding: 48px 0 64px; color: var(--text-dim); font-size: .85rem; }
.foot-inner { display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: space-between; }
.foot-links { display: flex; gap: 18px; flex-wrap: wrap; }

/* responsive */
@media (max-width: 960px) {
  .hero-inner, .two-col { grid-template-columns: 1fr; }
  .feature-grid { grid-template-columns: repeat(2, 1fr); }
  .sources { grid-template-columns: 1fr; }
  .nav-links { display: none; }
}
@media (max-width: 520px) { .feature-grid { grid-template-columns: 1fr; } section { padding: 64px 0; } }
```

- [ ] **Step 2: Verify** — serve; screenshots at desktop (resize viewport desktop) and mobile (resize viewport mobile); sections aligned, no overflow, demo grid usable at 390px.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: complete section styles and responsive layout"`

---

### Task 4: i18n — dictionaries, toggle, parity test

**Files:**
- Create: `js/i18n.js`
- Create: `js/test/i18n.test.mjs`
- Modify: `js/demo-grid.js` (replace `STR` with dict lookups)
- Modify: `js/main.js` (wire toggle button)

**Interfaces:**
- Produces: `t(key, params?)` → string; `applyLang(lang)`; `getLang()`; `LANGS = ['en', 'zh-CN']`. Keys used by HTML: `nav.how nav.features nav.agents nav.quickstart hero.kicker hero.title hero.sub hero.github stats.pulls demo.note demo.search how.kicker how.title how.lead how.s1.t how.s1.b how.s2.t how.s2.b how.s3.t how.s3.b how.legend.used how.legend.configured how.legend.free features.kicker features.title f1.t f1.b … f8.t f8.b agents.kicker agents.title agents.lead agents.link themes.kicker themes.title themes.lead quickstart.kicker quickstart.title quickstart.note limits.title limits.body footer.telemetry demo.counts demo.toast.listener demo.toast.conflict demo.toast.free demo.toast.copied`.

- [ ] **Step 1: Write failing test `js/test/i18n.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dict, t } from '../i18n.js';

test('en and zh-CN dictionaries have identical key sets', () => {
  const en = Object.keys(dict.en).sort(); const zh = Object.keys(dict['zh-CN']).sort();
  assert.deepEqual(en, zh);
});

test('t() interpolates {params} and falls back to en', () => {
  assert.equal(t('demo.toast.listener', { name: 'jellyfin', port: 8096 }, 'en'),
    'jellyfin is now listening on 8096');
  assert.equal(typeof t('no.such.key', {}, 'en'), 'undefined');
});
```

- [ ] **Step 2: Run, expect failure** — module missing.

- [ ] **Step 3: Implement `js/i18n.js`** — flat dicts for all keys listed above (EN strings = Task 1 copy verbatim; zh translations below), plus:

```js
export const dict = {
  en: { 'nav.how': 'How it works', /* …all keys… */ },
  'zh-CN': {
    'nav.how': '工作原理', 'nav.features': '功能亮点', 'nav.agents': '智能体', 'nav.quickstart': '快速开始',
    'hero.kicker': '给 homelab 的端口占用图',
    'hero.title': '哪个端口被谁占了，一眼看清',
    'hero.sub': 'Port-Light 把本机监听表、Docker 与 Compose 文件合并成一张红绿灯网格——哪个端口被占用、被谁占用、哪些还空着，一目了然。',
    'hero.github': '去 GitHub 点星',
    'stats.pulls': 'Docker 拉取',
    'demo.note': '实时演示 · 模拟数据', 'demo.search': '试试 3000…',
    'demo.counts': '{u} 个占用 · {c} 个已配置',
    'demo.toast.listener': '{name} 开始监听 {port}',
    'demo.toast.conflict': '冲突：两个栈同时声明端口 {port}',
    'demo.toast.free': '{port} 已被占用——附近有 {n} 个空闲端口',
    'demo.toast.copied': '已复制 {port}',
    'how.kicker': '工作原理', 'how.title': '三个本机来源，一张如实的占用图',
    'how.lead': '不需要装任何 agent，数据不出这台机器。Port-Light 只读取主机上已经存在的事实，合并成一张网格。',
    'how.s1.t': '主机监听表 · /proc, ss', 'how.s1.b': '当前真正绑定的 TCP/UDP 端口。',
    'how.s2.t': 'Docker API', 'how.s2.b': '容器名、状态、镜像与发布的端口映射。',
    'how.s3.t': 'Compose 文件', 'how.s3.b': '声明了的端口——即使栈没在跑。',
    'how.legend.used': '占用——有进程在监听', 'how.legend.configured': '已配置——声明了但没人听', 'how.legend.free': '空闲——搜索时给出备选',
    'features.kicker': '功能亮点', 'features.title': '为跑了一大堆栈的人而生',
    'f1.t': '搜索即建议', 'f1.b': '输入端口号；被占用时，附近空闲端口自动亮起。',
    'f2.t': '冲突雷达', 'f2.b': '两个 Compose 项目抢同一主机端口，撞车之前先预警。',
    'f3.t': '多机同屏', 'f3.b': '通过局域网或 Tailscale 拉取其他 Port-Light 实例的占用图。',
    'f4.t': '实时不滞后', 'f4.b': '占用一变，SSE 立刻推送刷新；本地历史记录每次状态变化。',
    'f5.t': '钩子与指标', 'f5.b': '新监听与冲突可触发 Webhook；需要时暴露 Prometheus 聚合指标。',
    'f6.t': '对智能体友好的 API', 'f6.b': 'GET /api/ports/suggest 给编码智能体一个真正空闲的端口——还支持租约。',
    'f7.t': '说你的语言', 'f7.b': '从 Gruvbox 到 Kanagawa 共 15 种配色；4 种界面语言。',
    'f8.t': '数据不出机器', 'f8.b': '无遥测、无账号、无云端。端口地图永远留在你的主机上。',
    'agents.kicker': '面向编码智能体', 'agents.title': '让智能体选端口，选了就不撞车',
    'agents.lead': '编码智能体瞎猜端口，总会和你的栈撞车。Port-Light 提供一个小 API 和 MCP stdio 服务器：给出真正空闲的端口，还能用带过期时间的租约预留。',
    'agents.link': 'MCP 服务器 · 智能体 Skill · API 文档 →',
    'themes.kicker': '外观', 'themes.title': '十五种配色，总有一款是你的',
    'themes.lead': '点一下，整站换装——和应用里一样。',
    'quickstart.kicker': '快速开始', 'quickstart.title': '一分钟跑起来',
    'quickstart.note': '镜像覆盖 linux/amd64 与 arm64，另有 GHCR。重要机器请钉版本标签，别用 latest。',
    'limits.title': '端口占用图——不是容器管理器',
    'limits.body': 'Port-Light 不启停容器、不看日志、不替代 Portainer。它是局域网工具：请设置 Basic Auth 或放在反向代理后面，永远不要把 2100 端口暴露到公网。',
    'footer.telemetry': 'MIT © 2026 StepaniaH · 无遥测',
  },
};
export function t(key, params = {}, lang = getLang()) {
  let s = (dict[lang] ?? dict.en)[key] ?? dict.en[key];
  if (s == null) return undefined;
  for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
export function getLang() { return localStorage.getItem('pl-lang') ?? 'en'; }
export function applyLang(lang) {
  localStorage.setItem('pl-lang', lang);
  document.documentElement.lang = lang === 'zh-CN' ? 'zh-CN' : 'en';
  document.getElementById('nav-lang-btn').textContent = lang === 'zh-CN' ? '中' : 'EN';
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const v = t(el.dataset.i18n); if (v != null) el.textContent = v;
  }
  for (const el of document.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':');
      const v = t(key); if (v != null) el.setAttribute(attr, v);
    }
  }
  document.dispatchEvent(new CustomEvent('pl:lang'));
}
```

zh strings for `f*.t/f*.b`, `how.*`, `agents.*` above are final; EN side mirrors Task 1 copy exactly.

- [ ] **Step 4: Run test, expect pass** — `node --test js/test/` → 2 passing.

- [ ] **Step 5: Demo grid uses dict** — delete local `STR`; import `t`; toast/counts strings become `t('demo.toast.listener', {name, port})` etc. Re-render counts on `pl:lang` event. Search placeholder handled by `data-i18n-attr`.

- [ ] **Step 6: Wire toggle in `js/main.js`** — `#nav-lang-btn` click toggles `en ↔ zh-CN` and calls `applyLang`. Initial call `applyLang(getLang())` on boot.

- [ ] **Step 7: Verify** — click 🌐: headline, nav, sections, demo toasts all switch to Chinese; `<html lang="zh-CN">`; reload persists. Switch back. No console errors.

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: bilingual i18n with EN default and zh-CN toggle"`

---

### Task 5: Theme switcher + live stats

**Files:**
- Create: `js/themes.js`
- Create: `js/stats.js`
- Modify: `js/main.js` (wire both)
- Modify: `css/main.css` (`#theme-menu` popover styles)

**Interfaces:**
- Consumes: `css/tokens.css` palette names; `#nav-theme-btn`, `#theme-menu`, `#theme-gallery`, `#stat-stars`, `#stat-pulls`.
- Produces: `initThemes()` (builds nav popover + gallery, applies saved theme); `initStats({starsFallback, pullsFallback})`.

- [ ] **Step 1: Bake fallback numbers** — run once:

```bash
curl -s https://api.github.com/repos/StepaniaH/port-light | grep -o '"stargazers_count":[0-9]*'
curl -s https://hub.docker.com/v2/repositories/stepaniah/port-light | grep -o '"pull_count":[0-9]*'
```

Record values; use them as fallbacks in `stats.js` and in `index.html` static text.

- [ ] **Step 2: Implement `js/themes.js`**

```js
export const THEMES = ['dark','light','gruvbox','gruvbox-light','catppuccin','catppuccin-latte',
  'dracula','everforest','kanagawa','nord','one-dark','rose-pine','solarized','solarized-light','tokyo-night'];
const LABEL = { dark: 'Midnight (default)', light: 'Daylight', gruvbox: 'Gruvbox', /* … readable names for all 15 … */ };
export function getTheme() { return document.documentElement.dataset.theme || 'dark'; }
export function applyTheme(id) {
  if (!THEMES.includes(id)) id = 'dark';
  document.documentElement.dataset.theme = id;
  localStorage.setItem('pl-theme', id);
  for (const c of document.querySelectorAll('[data-theme-card]'))
    c.classList.toggle('active', c.dataset.themeCard === id);
}
export function initThemes() {
  applyTheme(localStorage.getItem('pl-theme') ?? 'dark');
  // nav popover: #nav-theme-btn toggles #theme-menu (role=listbox); one button per theme;
  // click applies theme + closes. Close on Escape / outside click.
  // gallery: #theme-gallery gets .theme-card buttons; each card shows 3 swatch <i> strips
  // whose colors are read by temporarily applying the theme off-screen is overkill —
  // instead hardcode a SWATCH map {id: [bg, used, configured, free]} with hex values
  // copied from css/tokens.css (grep during implementation, paste real values).
}
```

Swatch values: extract with `awk` from `css/tokens.css` per theme (`--bg`, `--used`, `--configured`, `--free`) and paste into the `SWATCH` map — real hexes, no placeholders ship.

- [ ] **Step 3: Implement `js/stats.js`**

```js
const fmt = { k: n => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${n}` };
export function initStats({ starsFallback = 0, pullsFallback = 4433 } = {}) {
  const stars = document.getElementById('stat-stars');
  const pulls = document.getElementById('stat-pulls');
  stars.textContent = fmt.k(starsFallback);
  pulls.textContent = fmt.k(pullsFallback);
  const countUp = (el, target) => { /* 600ms rAF ease-out from current to target; reduced-motion: set directly */ };
  fetch('https://api.github.com/repos/StepaniaH/port-light')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => { if (typeof d.stargazers_count === 'number') countUp(stars, d.stargazers_count); })
    .catch(() => {});
  fetch('https://hub.docker.com/v2/repositories/stepaniah/port-light')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => { if (typeof d.pull_count === 'number') countUp(pulls, d.pull_count); })
    .catch(() => {});
}
```

- [ ] **Step 4: Wire in `js/main.js`** — import + `initThemes(); initStats({ starsFallback: N, pullsFallback: M });` with baked numbers.

- [ ] **Step 5: Verify** — click 🎨 → popover lists 15 themes; pick Catppuccin → whole site re-skins (hero glows, cards, terminal); reload persists; gallery cards show swatches with active ring; stats pills show live numbers (or fallback offline); no console errors.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: 15-theme switcher and live GitHub/Docker Hub stats"`

---

### Task 6: Reveal animations, copy buttons, boot assembly

**Files:**
- Create: `js/reveal.js`
- Modify: `js/main.js` (final assembly)
- Modify: `css/main.css` (theme-menu styles if not done)

**Interfaces:**
- Produces: `initReveal()`; shared `initCopyButtons()` for every `[data-copy]` / `.codeblock .copy-btn` (copies target text, flashes button label "✓").

- [ ] **Step 1: Implement `js/reveal.js`**

```js
export function initReveal() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { threshold: 0.12 });
  for (const el of document.querySelectorAll('[data-reveal]')) io.observe(el);
}
```

- [ ] **Step 2: Copy buttons** — one delegated listener in `main.js`: click on `[data-copy]` or `.copy-btn` → `navigator.clipboard.writeText(el.dataset.copy ?? el.closest('pre').textContent.trim())`; temporarily swap label to `✓` for 1.2s.

- [ ] **Step 3: Final `js/main.js`**

```js
import { applyLang, getLang } from './i18n.js';
import { initDemoGrid } from './demo-grid.js';
import { initThemes } from './themes.js';
import { initStats } from './stats.js';
import { initReveal } from './reveal.js';

applyLang(getLang());
initThemes();
initDemoGrid();
initStats({ starsFallback: <BAKED>, pullsFallback: <BAKED> });
initReveal();

document.getElementById('nav-lang-btn').addEventListener('click', () => {
  applyLang(getLang() === 'en' ? 'zh-CN' : 'en');
});
```

- [ ] **Step 4: Verify** — scroll: sections fade in once; copy buttons on pull-string, agents curl, compose YAML all flash ✓; reduced-motion emulation (browser.resize not needed — check CSS media query present) leaves page fully readable.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: scroll reveals, copy buttons, final boot assembly"`

---

### Task 7: README, robots, final QA + screenshots

**Files:**
- Create: `README.md`, `robots.txt`
- Modify: nothing else (fix pass only)

- [ ] **Step 1: Write `README.md`** — short: what this repo is (landing page for Port-Light), local preview (`python3 -m http.server`), deploy notes (Cloudflare Pages: no build command, output `/`), where content comes from (product README v0.7.0), theme/i18n notes, license MIT.

- [ ] **Step 2: `robots.txt`**

```
User-agent: *
Allow: /
```

- [ ] **Step 3: QA checklist (browser, both languages, 2 themes)**

Serve; verify each item, fix and re-verify before moving on:
1. Console: zero errors/warnings on load and after 30s (story loop ran).
2. EN + zh: no untranslated strings (spot-check nav, hero, one card toast, footer).
3. Desktop 1440 + mobile 390 screenshots: hero, features, agents, themes, quickstart.
4. Demo: search 3000 shows green suggestions; click copies; beam animates; reduced-motion path renders static grid (check `matchMedia` guard by CSS absence of `.beam`).
5. Theme switch across 3 palettes (dark, catppuccin, gruvbox-light): text contrast readable everywhere.
6. All external links resolve to correct GitHub/Docker Hub/Ko-fi URLs.
7. `node --test js/test/` → all passing.

- [ ] **Step 4: Capture final screenshots** for user review (browser.capture: `final-hero-desktop`, `final-features-desktop`, `final-hero-mobile`).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "chore: readme, robots, final QA pass"`

---

## Self-Review

**Spec coverage:** Hero (§4) → Tasks 1–2; sections 1–8 (§3) → Tasks 1, 3; themes easter egg (§3.6, §5) → Tasks 1 (tokens), 5 (switcher); i18n (§6) → Task 4; live stats + fallback (§6, §7) → Task 5; reveal animations (§5) → Task 6; a11y/reduced-motion (§5, §7) → Tasks 2, 3, 6 + QA; verification (§8) → Task 7; Cloudflare Pages deploy (§2) → README Task 7; sitemap deferred (§ Global Constraints) — noted. OG image deferred per spec §6. No gaps.

**Placeholder scan:** Demo-grid scenario bodies and swatch hexes are described with exact behavior/extraction commands and must be implemented concretely during execution — no "TBD"/"add error handling" patterns; all copy is final in the plan; `<BAKED>` stats numbers are produced by Task 5 Step 1 before use.

**Type consistency:** `t(key, params, lang)`, `applyLang(lang)`, `getLang()`, `initDemoGrid()`, `initThemes()`, `applyTheme(id)`, `initStats({starsFallback, pullsFallback})`, `initReveal()` — signatures consistent across Tasks 2, 4, 5, 6. DOM ids referenced in JS all exist in Task 1 HTML.
